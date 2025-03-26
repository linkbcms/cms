import { Client } from "pg";
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { defineConfig } from "../../type";
import { BaseSchemaGenerator, ColumnDefinition, SchemaDefinition, SchemaDifferences, SchemaGeneratorOptions, TableDefinition } from "./base";

export interface PostgresSchemaGeneratorOptions extends SchemaGeneratorOptions {
  connectionString?: string;
  schema?: string;
  ssl?: boolean;
}

/**
 * PostgreSQL-specific schema generator
 */
export class PostgresSchemaGenerator extends BaseSchemaGenerator {
  private client: Client;
  private schema: string;
  
  constructor(options: PostgresSchemaGeneratorOptions) {
    super(options);
    
    this.schema = options.schema || 'public';
    
    // Setup SSL options for Supabase compatibility
    const sslConfig = options.ssl === undefined ? 
      { rejectUnauthorized: false } : // Default for Supabase
      options.ssl;
    
    // Create PostgreSQL client
    this.client = new Client({
      connectionString: options.connectionString,
      ssl: sslConfig
    });
    
    console.log(chalk.blue(`PostgreSQL schema generator created for schema: ${this.schema}`));
  }
  
  /**
   * Initialize the database connection
   */
  public async initialize(): Promise<void> {
    try {
      // Connect to PostgreSQL
      await this.client.connect();
      
      // Create schema if it doesn't exist (for Supabase custom schemas)
      if (this.schema !== 'public') {
        await this.client.query(`CREATE SCHEMA IF NOT EXISTS "${this.schema}"`);
      }
      
      console.log(chalk.green('PostgreSQL connection initialized'));
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.error(chalk.red('Connection refused. Please check:'));
        console.error(chalk.yellow('1. Database server is running'));
        console.error(chalk.yellow('2. Connection string is correct'));
        console.error(chalk.yellow('3. Network allows connection to the database'));
        console.error(chalk.yellow(`Connection error: ${error.message}`));
      }
      throw error;
    }
  }
  
  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    try {
      await this.client.end();
      console.log(chalk.green('PostgreSQL connection closed'));
    } catch (error) {
      console.error(chalk.red('Error closing database connection:'), error);
    }
  }
  
  /**
   * Get current database schema
   */
  protected async getCurrentDatabaseSchema(): Promise<SchemaDefinition> {
    try {
      console.log(chalk.blue('Getting current PostgreSQL schema...'));
      
      // Ensure database connection
      if (!this.client) {
        console.log(chalk.yellow('Client not initialized, initializing...'));
        await this.initialize();
      }
      
      // Test connection
      try {
        const testResult = await this.client.query('SELECT 1 as test');
        console.log(chalk.green(`Connection test successful: ${JSON.stringify(testResult.rows[0])}`));
      } catch (error) {
        console.error(chalk.red('Connection test failed:'), error);
        console.log(chalk.yellow('Attempting to reconnect...'));
        await this.initialize();
      }
      
      console.log(chalk.blue(`Querying schema: ${this.schema}`));
      const result = await this.client.query(
        `
        SELECT table_name, column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = $1
        ORDER BY table_name, ordinal_position
        `, [this.schema]
      );
      
      console.log(chalk.green(`Found ${result.rows.length} columns`));
      
      const schema: SchemaDefinition = {};
      
      result.rows.forEach(row => {
        if (!schema[row.table_name]) {
          schema[row.table_name] = {};
        }
        schema[row.table_name][row.column_name] = {
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
          default: row.column_default,
          maxLength: row.character_maximum_length
        };
      });
      
      return schema;
    } catch (error) {
      console.error(chalk.red('Error getting current database schema:'), error);
      throw error;
    }
  }
  
  /**
   * Generate new schema based on config
   */
  protected async generateNewSchema(config: ReturnType<typeof defineConfig>): Promise<SchemaDefinition> {
    const schema: SchemaDefinition = {};
    
    if (!config.collections) {
      return schema;
    }
    
    for (const [collectionName, collection] of Object.entries(config.collections)) {
      // Check if collection has a schema
      const collectionSchema = this.getCollectionSchema(collection);
      if (!collectionSchema) continue;
      
      // Handle i18n collections
      const i18nConfig = this.getI18nConfig(collection);
      if (i18nConfig?.locales) {
        // Create main table
        schema[collectionName] = this.generateTableSchema(collectionSchema, false);
        
        // Create i18n tables for each locale
        for (const locale of i18nConfig.locales) {
          schema[`${collectionName}_${locale}`] = this.generateTableSchema(collectionSchema, true);
        }
      } else {
        // Create regular table
        schema[collectionName] = this.generateTableSchema(collectionSchema, false);
      }
    }
    
    return schema;
  }
  
  /**
   * Safely get collection schema regardless of collection type
   */
  private getCollectionSchema(collection: any): Record<string, any> | null {
    if (!collection) return null;
    
    // Try to access schema property safely
    if (typeof collection === 'object' && collection.schema) {
      return collection.schema;
    }
    
    return null;
  }
  
  /**
   * Safely get i18n config from collection
   */
  private getI18nConfig(collection: any): { locales: string[] } | null {
    if (!collection || typeof collection !== 'object') return null;
    
    // Try to access i18n property safely
    if (collection.i18n && Array.isArray(collection.i18n.locales)) {
      return collection.i18n;
    }
    
    return null;
  }
  
  /**
   * Generate table schema from collection schema
   */
  private generateTableSchema(schema: Record<string, any>, isI18n: boolean): TableDefinition {
    const tableSchema: TableDefinition = {
      id: {
        type: 'integer',
        nullable: false,
        default: 'nextval(\'id_seq\'::regclass)'
      }
    };
    
    for (const [fieldName, field] of Object.entries(schema)) {
      // Skip Component fields
      if (field.type === 'Component') continue;
      
      // Skip fields marked with db: false
      if (field.db === false) continue;
      
      // Skip i18n fields in main table or non-i18n fields in i18n tables
      if ((isI18n && !field.i18n) || (!isI18n && field.i18n)) continue;
      
      // Map field types to PostgreSQL types
      const pgType = this.mapFieldTypeToPostgres(field.type);
      if (!pgType) continue;
      
      tableSchema[fieldName] = {
        type: pgType,
        nullable: !field.required,
        default: field.default,
        maxLength: field.maxLength || null
      };
    }
    
    return tableSchema;
  }
  
  /**
   * Map field type to PostgreSQL type
   */
  private mapFieldTypeToPostgres(type: string): string | null {
    const typeMap: Record<string, string> = {
      text: 'text',
      textarea: 'text',
      date: 'timestamp',
      boolean: 'boolean',
      number: 'numeric',
      select: 'text',
      radio: 'text',
      checkbox: 'boolean',
      array: 'text[]',
      json: 'jsonb',
      relation: 'integer'
    };
    
    return typeMap[type] || null;
  }
  
  /**
   * Create migration file from schema differences
   */
  protected async createMigrationFromDifferences(differences: SchemaDifferences): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
    const migrationName = `schema_update_${timestamp}`;
    const migrationPath = path.join(this.migrationDir, `${timestamp}_${migrationName}.ts`);
    
    const upQueries: string[] = [];
    const downQueries: string[] = [];
    
    for (const [tableName, diff] of Object.entries(differences)) {
      if (diff.type === 'added' && diff.schema) {
        // Create table
        const columns = Object.entries(diff.schema)
          .map(([colName, colDef]) => {
            let def = `"${colName}" ${colDef.type}`;
            if (colDef.maxLength) def += `(${colDef.maxLength})`;
            if (!colDef.nullable) def += ' NOT NULL';
            if (colDef.default) def += ` DEFAULT ${colDef.default}`;
            return def;
          })
          .join(',\n  ');
          
        upQueries.push(`CREATE TABLE "${this.schema}"."${tableName}" (\n  ${columns}\n);`);
        downQueries.push(`DROP TABLE "${this.schema}"."${tableName}";`);
      } else if (diff.type === 'removed' && diff.schema) {
        // Drop table
        upQueries.push(`DROP TABLE "${this.schema}"."${tableName}";`);
        downQueries.push(`CREATE TABLE "${this.schema}"."${tableName}" (\n  ${Object.entries(diff.schema)
          .map(([colName, colDef]) => {
            let def = `"${colName}" ${colDef.type}`;
            if (colDef.maxLength) def += `(${colDef.maxLength})`;
            if (!colDef.nullable) def += ' NOT NULL';
            if (colDef.default) def += ` DEFAULT ${colDef.default}`;
            return def;
          })
          .join(',\n  ')}\n);`);
      } else if (diff.type === 'modified' && diff.changes) {
        // Handle column changes
        for (const [columnName, change] of Object.entries(diff.changes)) {
          if (change.type === 'added' && change.definition) {
            upQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" ADD COLUMN "${columnName}" ${change.definition.type}${change.definition.maxLength ? `(${change.definition.maxLength})` : ''}${!change.definition.nullable ? ' NOT NULL' : ''}${change.definition.default ? ` DEFAULT ${change.definition.default}` : ''};`);
            downQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" DROP COLUMN "${columnName}";`);
          } else if (change.type === 'removed' && change.definition) {
            upQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" DROP COLUMN "${columnName}";`);
            downQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" ADD COLUMN "${columnName}" ${change.definition.type}${change.definition.maxLength ? `(${change.definition.maxLength})` : ''}${!change.definition.nullable ? ' NOT NULL' : ''}${change.definition.default ? ` DEFAULT ${change.definition.default}` : ''};`);
          } else if (change.type === 'modified' && change.old && change.new) {
            // Handle type changes
            if (change.old.type !== change.new.type) {
              upQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" TYPE ${change.new.type}${change.new.maxLength ? `(${change.new.maxLength})` : ''};`);
              downQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" TYPE ${change.old.type}${change.old.maxLength ? `(${change.old.maxLength})` : ''};`);
            }
            
            // Handle nullable changes
            if (change.old.nullable !== change.new.nullable) {
              upQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" ${change.new.nullable ? 'DROP NOT NULL' : 'SET NOT NULL'};`);
              downQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" ${change.old.nullable ? 'DROP NOT NULL' : 'SET NOT NULL'};`);
            }
            
            // Handle default changes
            if (change.old.default !== change.new.default) {
              if (change.new.default) {
                upQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" SET DEFAULT ${change.new.default};`);
              } else {
                upQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT;`);
              }
              if (change.old.default) {
                downQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" SET DEFAULT ${change.old.default};`);
              } else {
                downQueries.push(`ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT;`);
              }
            }
          }
        }
      }
    }
    
    // Create migration file content
    const migrationContent = `/**
 * Auto-generated migration
 * Generated at: ${new Date().toISOString()}
 */

export async function up({ db, client, schema }) {
${upQueries.map(q => `  await client.query(\`${q}\`);`).join('\n')}
}

export async function down({ db, client, schema }) {
${downQueries.map(q => `  await client.query(\`${q}\`);`).join('\n')}
}
`;

    // Check if we should create a new migration file
    const shouldCreateNewMigration = await this.shouldCreateMigration(migrationContent);
    
    if (shouldCreateNewMigration) {
      fs.writeFileSync(migrationPath, migrationContent);
      console.log(chalk.green(`Created migration: ${migrationPath}`));
    } else {
      console.log(chalk.yellow('No new migration created: Content identical to previous migration'));
    }
  }
} 