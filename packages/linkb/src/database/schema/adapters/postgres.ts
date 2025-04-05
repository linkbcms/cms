import { Client } from "pg";
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import { defineConfig } from "../../type";
import { BaseSchemaGenerator, SchemaDefinition, SchemaDifferences, TableDefinition, SchemaGeneratorOptions, ColumnDefinition } from "../base";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { SqlDatabaseAdapter } from "./base";

// Define interfaces and types
export interface SchemaDiff {
  [tableName: string]: {
    type: 'added' | 'removed' | 'modified';
    schema?: Record<string, any>;
    changes?: Record<string, {
      type: 'added' | 'removed' | 'modified';
      definition?: Record<string, any>;
      old?: Record<string, any>;
      new?: Record<string, any>;
    }>
  }
}

export interface SchemaChange {
  type: 'table_created' | 'table_altered' | 'table_dropped' | 'column_added' | 'column_removed' | 'column_altered';
  name?: string;
  table?: string;
  schema?: Record<string, any>;
  newSchema?: Record<string, any>;
  column?: { name: string; type: string; [key: string]: any };
  originalColumn?: { name: string; type: string; [key: string]: any };
}

export interface MigrationInfo {
  timestamp: string;
  name: string;
  created: boolean;
  hasSchemaChanges: boolean;
  path: string;
}

export type PostgresConnection = NodePgDatabase<Record<string, never>> & { $client: Client };

export interface PostgresSchemaGeneratorOptions extends SchemaGeneratorOptions {
  db: PostgresConnection;
  schema?: string;
}

/**
 * Database column information from information_schema
 */
interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
}

/**
 * PostgreSQL adapter for database operations
 */
export class PostgresAdapter extends SqlDatabaseAdapter {
  private client: Client;
  
  constructor(client: Client, schema: string = "public") {
    super(schema);
    this.client = client;
    
    console.log(chalk.blue(`PostgreSQL schema adapter created for schema: ${this.schema}`));
  }
  
  /**
   * Execute a query on the PostgreSQL database
   */
  public async query(sql: string, params: any[] = []): Promise<any> {
    try {
      const result = await this.client.query(sql, params);
      return result;
    } catch (error) {
      console.error(chalk.red('Error executing query:'), error);
      throw error;
    }
  }
  
  /**
   * Get table and column information from the PostgreSQL database
   */
  public async getTableAndColumnInfo(): Promise<any> {
    const result = await this.query(
      `
      SELECT table_name, column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = $1
      ORDER BY table_name, ordinal_position
      `, [this.schema]
    );
    
    return result.rows;
  }
  
  /**
   * Generate SQL for creating a table in PostgreSQL
   */
  public generateCreateTableSql(tableName: string, columns: Record<string, any>): string {
    const columnDefinitions = Object.entries(columns)
      .map(([colName, colDef]) => {
        let def = `"${colName}" ${colDef.type}`;
        if (colDef.maxLength) def += `(${colDef.maxLength})`;
        if (!colDef.nullable) def += ' NOT NULL';
        if (colDef.default) def += ` DEFAULT ${colDef.default}`;
        return def;
      })
      .join(',\n  ');
      
    return `CREATE TABLE "${this.schema}"."${tableName}" (\n  ${columnDefinitions}\n);`;
  }
  
  /**
   * Generate SQL statements for altering a table in PostgreSQL
   */
  public generateAlterTableSql(tableName: string, changes: Record<string, any>): string[] {
    const alterStatements: string[] = [];
    
    for (const [columnName, change] of Object.entries(changes)) {
      if (change.type === 'added' && change.definition) {
        alterStatements.push(
          `ALTER TABLE "${this.schema}"."${tableName}" ADD COLUMN "${columnName}" ${change.definition.type}${change.definition.maxLength ? `(${change.definition.maxLength})` : ''}${!change.definition.nullable ? ' NOT NULL' : ''}${change.definition.default ? ` DEFAULT ${change.definition.default}` : ''};`
        );
      } else if (change.type === 'removed') {
        alterStatements.push(
          `ALTER TABLE "${this.schema}"."${tableName}" DROP COLUMN "${columnName}";`
        );
      } else if (change.type === 'modified' && change.old && change.new) {
        // Handle type changes
        if (change.old.type !== change.new.type) {
          alterStatements.push(
            `ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" TYPE ${change.new.type}${change.new.maxLength ? `(${change.new.maxLength})` : ''};`
          );
        }
        
        // Handle nullable changes
        if (change.old.nullable !== change.new.nullable) {
          alterStatements.push(
            `ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" ${change.new.nullable ? 'DROP NOT NULL' : 'SET NOT NULL'};`
          );
        }
        
        // Handle default changes
        if (change.old.default !== change.new.default) {
          if (change.new.default) {
            alterStatements.push(
              `ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" SET DEFAULT ${change.new.default};`
            );
          } else {
            alterStatements.push(
              `ALTER TABLE "${this.schema}"."${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT;`
            );
          }
        }
      }
    }
    
    return alterStatements;
  }
}

/**
 * PostgreSQL-specific schema generator
 */
export class PostgresSchemaGenerator extends BaseSchemaGenerator {
  private schema: string;
  
  constructor(options: PostgresSchemaGeneratorOptions) {
    // Create a PostgreSQL adapter directly using the client from the database connection
    const adapter = new PostgresAdapter(options.db.$client, options.schema);
    
    // Pass the adapter to the base class
    super(adapter, options);
    
    this.schema = options.schema || 'public';
    
    console.log(chalk.blue(`PostgreSQL schema generator created for schema: ${this.schema}`));
    console.log(chalk.blue(`Migrations will be stored in: ${this.migrationDir}`));
  }
  
  /**
   * Get current database schema
   */
  protected async getCurrentDatabaseSchema(): Promise<SchemaDefinition> {
    try {
      console.log(chalk.blue('Getting current PostgreSQL schema...'));
      
      // We're no longer testing the connection here since it should be tested at the database adapter level
      
      console.log(chalk.blue(`Querying schema: ${this.schema}`));
      const result = await this.adapter.query(
        `
        SELECT table_name, column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = $1
        ORDER BY table_name, ordinal_position
        `, [this.schema]
      );
      
      console.log(chalk.green(`Found ${result.rows.length} columns`));
      
      const schema: SchemaDefinition = {};
      
      result.rows.forEach((row: ColumnInfo) => {
        if (!schema[row.table_name]) {
          schema[row.table_name] = {};
        }
        schema[row.table_name][row.column_name] = {
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
          default: row.column_default || undefined,
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
   * Safely get i18n config from collection
   */
  private getI18nConfig(collection: any): { locales: string[]; defaultLocale?: string } | null {
    if (!collection || typeof collection !== 'object') return null;
    
    // Try to access i18n property safely
    if (collection.i18n && Array.isArray(collection.i18n.locales)) {
      return {
        locales: collection.i18n.locales,
        defaultLocale: collection.i18n.defaultLocale
      };
    }
    
    return null;
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
      
      // Create main table
      schema[collectionName] = this.generateTableSchema(collectionSchema);
      
      // If i18n is configured, create identical tables for all locales
      if (i18nConfig?.locales) {
        for (const locale of i18nConfig.locales) {
          schema[`${collectionName}_${locale}`] = this.generateTableSchema(collectionSchema);
        }
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
   * Generate table schema from collection schema
   */
  private generateTableSchema(schema: Record<string, any>): TableDefinition {
    const tableSchema: TableDefinition = {
      id: {
        type: 'integer',
        nullable: false,
        default: 'nextval(\'id_seq\'::regclass)'
      }
    };
    
    for (const [fieldName, field] of Object.entries(schema)) {
      field.type = "text"; // Force all fields to "text" type
      
      // Skip Component fields
      if (field.type === 'Component') continue;
      
      // Skip fields marked with db: false
      if (field.db === false) continue;
      
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
      text: 'varchar',
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
   * Convert camelCase to snake_case
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
  
  /**
   * Generate Drizzle table schema definition exactly matching the user's example
   */
  private generateExactDrizzleTableSchema(tableName: string, schema: Record<string, any>, allTables: string[]): { tableDefinition: string; indexes?: string[] } {
    // Generate column definitions
    const columnParts: string[] = [];
    const indexDefinitions: string[] = [];
    const tableConstraints: string[] = [];
    
    // Convert column names: convert camelCase to snake_case and track the mappings
    const columnNameMappings: Record<string, string> = {};
    Object.keys(schema).forEach(colName => {
      if (colName !== 'id' && !colName.includes('_') && /[A-Z]/.test(colName)) {
        columnNameMappings[colName] = this.camelToSnake(colName);
      }
    });
    
    Object.entries(schema).forEach(([colName, colDef]) => {
      // Special handling for ID field
      if (colName === 'id') {
        columnParts.push(`    id: t.integer().primaryKey().generatedAlwaysAsIdentity()`);
        return;
      }
      
      // Convert camelCase column names to snake_case for the type function
      const snakeCaseName = columnNameMappings[colName] || colName;
      
      // Get type function and options
      const { typeFunc } = this.getExactDrizzleTypeFunction(colDef.type, snakeCaseName, colDef.maxLength);
      
      // Build the column definition
      let columnDef = `    ${colName}: ${typeFunc}`;
      
      // Add constraints
      if (!colDef.nullable) {
        columnDef += '.notNull()';
      }
      
      // Add default if present
      if (colDef.default) {
        columnDef += `.default(${this.formatDrizzleDefault(colDef.default, colDef.type)})`;
      } else {
        // Add smart defaults for common columns
        const defaultValue = this.getDefaultForColumn(colName, colDef.type);
        if (defaultValue) {
          columnDef += defaultValue;
        }
        
        // Special handling for slug fields
        if (colName === 'slug' && (colDef.type.toLowerCase() === 'varchar' || colDef.type.toLowerCase() === 'text')) {
          columnDef += `.$default(() => generateUniqueString(16))`;
        }
      }
      
      // Add foreign key reference if this is a foreign key column
      if (colName.endsWith('Id') && colName !== 'id') {
        const referencedTable = this.findReferencedTable(colName, allTables);
        if (referencedTable) {
          columnDef += `.references(() => ${referencedTable}.id)`;
        }
      }
      
      columnParts.push(columnDef);
      
      // Check if this column should have an index
      if (this.shouldHaveIndex(colName)) {
        if (this.shouldHaveUniqueIndex(colName)) {
          tableConstraints.push(`    t.uniqueIndex("${colName}_idx").on(table.${colName})`);
          indexDefinitions.push(`CREATE UNIQUE INDEX "${tableName}_${colName}_idx" ON "${this.schema}"."${tableName}" ("${colName}")`);
        } else {
          tableConstraints.push(`    t.index("${colName}_idx").on(table.${colName})`);
          indexDefinitions.push(`CREATE INDEX "${tableName}_${colName}_idx" ON "${this.schema}"."${tableName}" ("${colName}")`);
        }
      }
    });
    
    // Build the table definition
    let tableDefinition = `export const ${tableName} = table(\n  "${tableName}",\n  {\n${columnParts.join(',\n')}\n  }`;
    
    // Add table constraints if present
    if (tableConstraints.length > 0) {
      tableDefinition += `,\n  (table) => [\n${tableConstraints.join(',\n')}\n  ]`;
    }
    
    // Close the table definition
    tableDefinition += `\n);`;
    
    return { tableDefinition, indexes: indexDefinitions };
  }
  
  /**
   * Find referenced table name from a foreignKey column
   */
  private findReferencedTable(columnName: string, allTables: string[]): string | null {
    // Extract table name from columnName (e.g. userId -> user)
    const tableSingular = columnName.replace(/Id$/, '').toLowerCase();
    
    // Try different variations of the table name (singular, plural)
    const possibleTableNames = [
      tableSingular,
      `${tableSingular}s`, // Simple plural
      tableSingular.replace(/y$/, 'ies'), // Handle y -> ies pluralization
    ];
    
    // Find matching table in allTables
    for (const tableName of possibleTableNames) {
      if (allTables.includes(tableName)) {
        return tableName;
      }
    }
    
    return null;
  }
  
  /**
   * Check if a column should have an index
   */
  private shouldHaveIndex(columnName: string): boolean {
    // Common indexed columns
    const indexedColumns = [
      'email', 'username', 'slug', 'sku', 'code',
      'status', 'type', 'category'
    ];
    
    // Check exact match
    if (indexedColumns.includes(columnName.toLowerCase())) {
      return true;
    }
    
    // Check if column ends with Id (foreign key)
    if (columnName.endsWith('Id')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if a column should have a unique index
   */
  private shouldHaveUniqueIndex(columnName: string): boolean {
    // Common unique columns
    const uniqueColumns = ['email', 'username', 'slug'];
    
    return uniqueColumns.includes(columnName.toLowerCase());
  }
  
  /**
   * Get the appropriate Drizzle type function for a PostgreSQL type
   */
  private getExactDrizzleTypeFunction(
    postgresType: string, 
    columnName: string,
    maxLength?: number
  ): { typeFunc: string; } {
    const type = postgresType.toLowerCase();
    
    // UUID type
    if (type === 'uuid') {
      return { typeFunc: 't.uuid()' };
    }
    
    // Integer types
    if (type === 'integer' || type === 'int' || type === 'int4') {
      return { typeFunc: 't.integer()' };
    }
    
    if (type === 'bigint' || type === 'int8') {
      return { typeFunc: 't.bigint()' };
    }
    
    if (type === 'smallint' || type === 'int2') {
      return { typeFunc: 't.smallint()' };
    }
    
    // Numeric/Decimal types
    if (type === 'numeric' || type === 'decimal') {
      return { typeFunc: 't.decimal()' };
    }
    
    if (type === 'real' || type === 'float4') {
      return { typeFunc: 't.real()' };
    }
    
    if (type === 'double precision' || type === 'float8') {
      return { typeFunc: 't.doublePrecision()' };
    }
    
    // Text/String types
    if (type === 'text') {
      return { typeFunc: 't.text()' };
    }
    
    if (type === 'varchar' || type.startsWith('character varying')) {
      if (maxLength) {
        return { typeFunc: `t.varchar(${maxLength})` };
      }
      return { typeFunc: 't.varchar()' };
    }
    
    if (type === 'char' || type.startsWith('character')) {
      if (maxLength) {
        return { typeFunc: `t.char(${maxLength})` };
      }
      return { typeFunc: 't.char()' };
    }
    
    // Boolean type
    if (type === 'boolean' || type === 'bool') {
      return { typeFunc: 't.boolean()' };
    }
    
    // Date/Time types
    if (type === 'date') {
      return { typeFunc: 't.date()' };
    }
    
    if (type === 'time' || type.startsWith('time without time zone')) {
      return { typeFunc: 't.time()' };
    }
    
    if (type === 'timestamp' || type.startsWith('timestamp without time zone')) {
      return { typeFunc: 't.timestamp()' };
    }
    
    if (type === 'timestamptz' || type.startsWith('timestamp with time zone')) {
      return { typeFunc: 't.timestamptz()' };
    }
    
    // JSON types
    if (type === 'json') {
      return { typeFunc: 't.json()' };
    }
    
    if (type === 'jsonb') {
      return { typeFunc: 't.jsonb()' };
    }
    
    // Array types
    if (type.endsWith('[]')) {
      const baseType = type.slice(0, -2);
      const { typeFunc } = this.getExactDrizzleTypeFunction(baseType, columnName);
      // Extract the base type without parentheses
      const baseTypeNoParens = typeFunc.replace(/\(.*\)/, '');
      return { typeFunc: `${baseTypeNoParens}.array()` };
    }
    
    // Default to text() for unknown types
    return { typeFunc: 't.text()' };
  }
  
  /**
   * Get an appropriate default value for common column names/types
   */
  private getDefaultForColumn(colName: string, type: string): string {
    // Handle timestamps
    if (
      (colName === 'createdAt' || colName === 'created_at') && 
      type.toLowerCase().includes('timestamp')
    ) {
      return '.defaultNow()';
    }
    
    // Handle UUIDs
    if (type.toLowerCase() === 'uuid') {
      // Special case for ID columns
      if (colName === 'id') {
        return '.defaultRandom()';
      }
      
      // Other UUID columns
      if (colName.endsWith('Uuid') || colName.endsWith('_uuid')) {
        return '.defaultRandom()';
      }
    }
    
    // Handle Boolean defaults
    if (type.toLowerCase() === 'boolean' || type.toLowerCase() === 'bool') {
      if (colName.startsWith('is') || colName.startsWith('has')) {
        return '.default(false)';
      }
    }
    
    // No special default
    return '';
  }
  
  /**
   * Format default value for Drizzle schema
   */
  private formatDrizzleDefault(defaultValue: any, type: string): string {
    // Handle special case for timestamp defaults
    if (defaultValue === 'CURRENT_TIMESTAMP' || defaultValue === 'now()') {
      return 'sql`now()`';
    }
    
    // Handle UUID default
    if (defaultValue === 'uuid_generate_v4()') {
      return 'sql`uuid_generate_v4()`';
    }
    
    // Handle boolean defaults
    if (type.toLowerCase() === 'boolean') {
      if (defaultValue === 'true' || defaultValue === true) {
        return 'true';
      } else if (defaultValue === 'false' || defaultValue === false) {
        return 'false';
      }
    }
    
    // Handle numeric defaults
    if (/^[0-9]+(\.[0-9]+)?$/.test(String(defaultValue))) {
      return defaultValue;
    }
    
    // Default to string representation with quotes
    return `'${defaultValue}'`;
  }

  /**
   * Create a new migration file from differences
   */
  protected async createMigrationFromDifferences(differences: SchemaDifferences): Promise<void> {
    console.log(chalk.blue('Creating migration from differences...'));
    
    // Extract schema changes from differences
    const diffDetails: SchemaChange[] = this.extractSchemaChanges(differences);
    
    // Skip if there are no actual changes
    if (diffDetails.length === 0) {
      console.log(chalk.yellow('No schema changes detected. Skipping migration creation.'));
      return;
    }
    
    console.log(chalk.blue(`Found ${diffDetails.length} schema changes.`));
    
    // Strictly check for pending migrations - we'll only allow creation if none exist
    const hasPendingMigrations = await this.hasPendingMigrations();
    
    if (hasPendingMigrations) {
      console.log(chalk.red('⚠️ MIGRATION CREATION BLOCKED: Pending migrations detected'));
      console.log(chalk.yellow('This CMS only allows one pending migration at a time.'));
      console.log(chalk.yellow('You must apply your existing pending migration before creating a new one:'));
      console.log(chalk.green('   npx linkb migrate'));
      console.log(chalk.yellow('This ensures your database schema stays in sync with your changes.'));
      console.log(chalk.red('Migration creation aborted. Please apply pending migrations first.'));
      return;
    }
    
    console.log(chalk.green('No pending migrations found. Proceeding with creating a new migration...'));
    
    // Generate timestamp for the migration folder name
    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join('');
    
    // Use timestamp as the migration name
    const migrationName = `${timestamp}`;
    
    // Use the migrationDir from BaseSchemaGenerator
    const migrationDir = path.join(this.migrationDir, migrationName);
    
    console.log(chalk.blue(`Creating migration in directory: ${migrationDir}`));
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true });
    }

    // Path for SQL file with raw SQL statements
    const sqlFilePath = path.join(migrationDir, 'migration.sql');
    
    // Collect tables to be created or modified
    const tableNames: string[] = [];
    
    // Generate SQL statements for migrations based on the schema definitions
    const createTableStatements: string[] = [];
    const dropTableStatements: string[] = [];
    
    diffDetails.forEach(change => {
      if (change.type === 'table_created' && change.name && change.schema) {
        tableNames.push(change.name);
        
        // Generate proper CREATE TABLE statement from schema
        const columnDefs = Object.entries(change.schema).map(([colName, colDef]: [string, any]) => {
          // Special handling for ID column
          if (colName === 'id') {
            return `  "id" SERIAL PRIMARY KEY`;
          }
          
          // Start with column name and type
          let type = colDef.type.toLowerCase();
          
          // If it's a text field, use varchar instead
          if (type === 'text') {
            type = 'varchar';
          }
          
          // Add length parameter if specified
          if (colDef.maxLength && (type === 'varchar' || type === 'char')) {
            type = `${type}(${colDef.maxLength})`;
          }
          
          // Add constraints
          let constraints = '';
          if (!colDef.nullable) {
            constraints += ' NOT NULL';
          }
          
          // Add default if present
          if (colDef.default) {
            constraints += ` DEFAULT ${colDef.default}`;
          }
          
          return `  "${colName}" ${type}${constraints}`;
        });
        
        // Add foreign key constraints if any column has references - disabled for i18n tables
        // We're not using foreign keys for i18n tables anymore
        const foreignKeyConstraints: string[] = [];
        
        // Combine column definitions and foreign key constraints
        const allDefs = [...columnDefs];
        if (foreignKeyConstraints.length > 0) {
          allDefs.push(...foreignKeyConstraints);
        }
        
        createTableStatements.push(`CREATE TABLE IF NOT EXISTS "${this.schema}"."${change.name}" (
${allDefs.join(',\n')}
)`);
        
        dropTableStatements.push(`DROP TABLE IF EXISTS "${this.schema}"."${change.name}"`);
        
        // For i18n tables, add indices on slug or id fields if they exist
        if (change.name.includes('_') && change.schema) {
          // This is an i18n table - add appropriate indices
          const idxFields = ['slug', 'code', 'sku', 'email', 'username'];
          
          for (const field of idxFields) {
            if (change.schema[field]) {
              // Create index for this field
              const indexStatement = `CREATE INDEX IF NOT EXISTS "${change.name}_${field}_idx" ON "${this.schema}"."${change.name}" ("${field}")`;
              createTableStatements.push(indexStatement);
            }
          }
        }
      }
    });
    
    // Generate alter table statements if needed
    diffDetails.forEach(change => {
      if (change.type === 'table_altered' && change.name) {
        // Get table changes from table diff
        const tableChanges = (change as any).changes;
        if (tableChanges) {
          const alterStatements: string[] = [];
          
          // Process each column change
          for (const [colName, colChangeAny] of Object.entries(tableChanges)) {
            const colChange = colChangeAny as {
              type: 'added' | 'removed' | 'modified';
              definition?: Record<string, any>;
              old?: Record<string, any>;
              new?: Record<string, any>;
            };
            
            if (colChange.type === 'added' && colChange.definition) {
              // New column definition
              let type = colChange.definition.type.toLowerCase();
              
              // If it's a text field, use varchar instead
              if (type === 'text') {
                type = 'varchar';
              }
              
              // Add length parameter if specified
              if (colChange.definition.maxLength && (type === 'varchar' || type === 'char')) {
                type = `${type}(${colChange.definition.maxLength})`;
              }
              
              // Add constraints
              let constraints = '';
              if (!colChange.definition.nullable) {
                constraints += ' NOT NULL';
              }
              
              // Add default if present
              if (colChange.definition.default) {
                constraints += ` DEFAULT ${colChange.definition.default}`;
              }
              
              alterStatements.push(`ALTER TABLE "${this.schema}"."${change.name}" ADD COLUMN "${colName}" ${type}${constraints};`);
            } else if (colChange.type === 'removed') {
              alterStatements.push(`ALTER TABLE "${this.schema}"."${change.name}" DROP COLUMN "${colName}";`);
            } else if (colChange.type === 'modified' && colChange.old && colChange.new) {
              // Handle type changes
              if (colChange.old.type !== colChange.new.type) {
                let newType = colChange.new.type.toLowerCase();
                
                // If it's a text field, use varchar instead
                if (newType === 'text') {
                  newType = 'varchar';
                }
                
                // Add length parameter if specified
                if (colChange.new.maxLength && (newType === 'varchar' || newType === 'char')) {
                  newType = `${newType}(${colChange.new.maxLength})`;
                }
                
                alterStatements.push(`ALTER TABLE "${this.schema}"."${change.name}" ALTER COLUMN "${colName}" TYPE ${newType};`);
              }
              
              // Handle nullability changes
              if (colChange.old.nullable !== colChange.new.nullable) {
                alterStatements.push(`ALTER TABLE "${this.schema}"."${change.name}" ALTER COLUMN "${colName}" ${colChange.new.nullable ? 'DROP NOT NULL' : 'SET NOT NULL'};`);
              }
              
              // Handle default changes
              if (colChange.old.default !== colChange.new.default) {
                if (colChange.new.default) {
                  alterStatements.push(`ALTER TABLE "${this.schema}"."${change.name}" ALTER COLUMN "${colName}" SET DEFAULT ${colChange.new.default};`);
                } else {
                  alterStatements.push(`ALTER TABLE "${this.schema}"."${change.name}" ALTER COLUMN "${colName}" DROP DEFAULT;`);
                }
              }
            }
          }
          
          if (alterStatements.length > 0) {
            // Add all alter statements to the migration
            createTableStatements.push(alterStatements.join('\n'));
          }
        }
      }
    });
    
    // Extract index statements from createTableStatements
    const indexStatements: string[] = createTableStatements.filter(stmt => stmt.startsWith('CREATE INDEX') || stmt.startsWith('CREATE UNIQUE INDEX'));
    
    // Remove index statements from createTableStatements
    const tableStatements = createTableStatements.filter(stmt => !stmt.startsWith('CREATE INDEX') && !stmt.startsWith('CREATE UNIQUE INDEX'));
    
    // Generate SQL file content
    const sqlContent = `-- Migration: ${migrationName}
-- Generated at: ${new Date().toISOString()}

-- Up Migration
BEGIN;

-- Create Tables
${tableStatements.join(';\n\n')}; 

-- Create Indexes
${indexStatements.length > 0 ? indexStatements.join(';\n\n') + ';' : '-- No indexes needed'}

COMMIT;

-- Down Migration
BEGIN;

-- Drop Tables  
${dropTableStatements.join(';\n')}; 

COMMIT;
`;
    
    // Write sql.ts file
    fs.writeFileSync(sqlFilePath, sqlContent);
    
    // Collect Drizzle schema definitions
    const enumTypes: Record<string, string[]> = {};
    
    diffDetails.forEach(change => {
      if (change.type === 'table_created' || change.type === 'table_altered') {
        // Ensure name is defined before pushing to tableNames
        if (change.name) {
          tableNames.push(change.name);
        }
      }
      
      // Look for enum types in added columns with type safety checks
      if (change.type === 'column_added' && change.column?.type?.toLowerCase().includes('enum')) {
        // Extract enum name from column type (e.g., app_status_enum from app_status_enum)
        const enumMatch = change.column.type.match(/(\w+_enum)/);
        if (enumMatch && enumMatch[1]) {
          const enumName = enumMatch[1];
          // Extract enum values if available
          const enumValues: string[] = [];
          
          // Add enum type if not already added
          if (!enumTypes[enumName]) {
            enumTypes[enumName] = enumValues;
          }
        }
      }
    });
    
    // Generate enum definitions
    const enumDefinitions: string[] = Object.entries(enumTypes).map(([enumName, values]) => {
      const valuesString = values.map(v => `'${v}'`).join(', ');
      return `export const ${enumName} = pgEnum('${enumName}', [${valuesString}]);`;
    });
    
    // Generate table schema definitions
    const tableDefinitions: string[] = [];
    
    diffDetails.forEach(change => {
      if (change.type === 'table_created' && change.name && change.schema) {
        // Generate Drizzle schema for new table
        const { tableDefinition } = this.generateExactDrizzleTableSchema(
          change.name, 
          change.schema,
          tableNames
        );
        tableDefinitions.push(tableDefinition);
      } else if (change.type === 'table_altered' && change.name && change.newSchema) {
        // Handle table modifications if needed
        const { tableDefinition } = this.generateExactDrizzleTableSchema(
          change.name, 
          change.newSchema,
          tableNames
        );
        tableDefinitions.push(tableDefinition);
      }
    });
    
    // Generate migration file content with updated imports
    const migrationContent = `import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Schema definitions
${enumDefinitions.join('\n\n')}

// Table definitions
${tableDefinitions.join('\n\n')}

// Helper function for generating unique strings
export function generateUniqueString(length: number = 16) {
  return sql\`substr(md5(random()::text), 0, \${length})\`;
}
`;
    
    // Write index.ts file
    const migrationFilePath = path.join(migrationDir, 'index.ts');
    fs.writeFileSync(migrationFilePath, migrationContent);
    
    console.log(chalk.green(`Created migration in ${migrationDir}`));
  }
  
  /**
   * Extract schema changes from differences object
   */
  private extractSchemaChanges(differences: SchemaDifferences): SchemaChange[] {
    const changes: SchemaChange[] = [];
    
    for (const [tableName, diff] of Object.entries(differences)) {
      if (diff.type === 'added' && diff.schema) {
        changes.push({
          type: 'table_created',
          name: tableName,
          schema: diff.schema
        });
      } else if (diff.type === 'removed' && diff.schema) {
        changes.push({
          type: 'table_dropped',
          name: tableName,
          schema: diff.schema
        });
      } else if (diff.type === 'modified' && diff.changes) {
        changes.push({
          type: 'table_altered',
          name: tableName,
          newSchema: diff.schema
        });
        
        // Process column changes
        for (const [colName, colChange] of Object.entries(diff.changes)) {
          if (colChange.type === 'added' && colChange.definition) {
            changes.push({
              type: 'column_added',
              table: tableName,
              column: {
                name: colName,
                ...colChange.definition
              }
            });
          } else if (colChange.type === 'removed' && colChange.definition) {
            changes.push({
              type: 'column_removed',
              table: tableName,
              column: {
                name: colName,
                ...colChange.definition
              }
            });
          } else if (colChange.type === 'modified' && colChange.old && colChange.new) {
            changes.push({
              type: 'column_altered',
              table: tableName,
              column: {
                name: colName,
                ...colChange.new
              },
              originalColumn: {
                name: colName,
                ...colChange.old
              }
            });
          }
        }
      }
    }
    
    return changes;
  }
  
  /**
   * Check if there are pending migrations by comparing latest migration in database with latest migration folder
   * @returns true if there are pending migrations
   */
  protected async hasPendingMigrations(): Promise<boolean> {
    try {
      console.log(chalk.blue('Checking for pending migrations...'));
      
      // Get latest migration from the database
      const migrationsTableExists = await this.checkMigrationsTableExists();
      if (!migrationsTableExists) {
        console.log(chalk.yellow('Migrations table does not exist yet. Checking if there are migration folders...'));
        // If migrations table doesn't exist, check if there are migration folders
        if (!fs.existsSync(this.migrationDir)) {
          console.log(chalk.yellow('Migrations directory does not exist.'));
          return false;
        }
        
        const entries = fs.readdirSync(this.migrationDir, { withFileTypes: true });
        // Only look for timestamp-based migration folders (YYYYMMDDHHMMSS format)
        const hasMigrationFolders = entries.some(entry => entry.isDirectory() && 
          (/^\d{14}/.test(entry.name) || /^\d{8}_\d{6}/.test(entry.name)));
        console.log(chalk.yellow(`Found ${hasMigrationFolders ? 'existing' : 'no'} migration folders.`));
        return hasMigrationFolders;
      }
      
      // Get latest applied migration from the database
      const latestDbMigrationResult = await this.adapter.query(
        `SELECT name, batch FROM migrations ORDER BY batch DESC, name DESC LIMIT 1`
      );
      
      const latestDbMigration = latestDbMigrationResult.rows.length > 0 
        ? latestDbMigrationResult.rows[0].name 
        : null;
      
      console.log(chalk.blue(`Latest applied migration in database: ${latestDbMigration || 'none'}`));
      
      // If no migrations in database, we need to check if there are migration folders
      if (!latestDbMigration) {
        // Check if there are any migration folders
        if (!fs.existsSync(this.migrationDir)) {
          console.log(chalk.yellow('Migrations directory does not exist.'));
          return false;
        }
        
        const entries = fs.readdirSync(this.migrationDir, { withFileTypes: true });
        // Only look for timestamp-based migration folders
        const hasMigrationFolders = entries.some(entry => entry.isDirectory() && 
          (/^\d{14}/.test(entry.name) || /^\d{8}_\d{6}/.test(entry.name)));
        console.log(chalk.yellow(`Found ${hasMigrationFolders ? 'existing' : 'no'} migration folders.`));
        return hasMigrationFolders;
      }
      
      // Get all migrations folders
      if (!fs.existsSync(this.migrationDir)) {
        console.log(chalk.yellow('Migrations directory does not exist.'));
        return false;
      }
      
      const migrationFolders = fs.readdirSync(this.migrationDir)
        // Only look for timestamp-based migration folders
        .filter(name => /^\d{14}/.test(name) || /^\d{8}_\d{6}/.test(name))
        .sort((a, b) => b.localeCompare(a));  // Sort descending to get latest first
      
      if (migrationFolders.length === 0) {
        console.log(chalk.yellow('No migration folders found.'));
        return false;
      }
      
      // Get latest migration folder name
      const latestMigrationFolder = migrationFolders[0];
      console.log(chalk.blue(`Latest migration folder: ${latestMigrationFolder}`));
      
      // If the latest folder doesn't match the latest applied migration,
      // it means there's a pending migration
      const hasPending = latestDbMigration !== latestMigrationFolder;
      console.log(chalk.blue(`Has pending migrations: ${hasPending ? 'YES' : 'NO'}`));
      return hasPending;
    } catch (error) {
      console.error(chalk.red(`Error checking for pending migrations: ${error}`));
      return false;  // Assume no pending migrations in case of error
    }
  }
  
  /**
   * Check if the migrations table exists
   */
  private async checkMigrationsTableExists(): Promise<boolean> {
    try {
      const result = await this.adapter.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'migrations'
        );
      `);
      
      return result.rows[0].exists;
    } catch (error) {
      console.error(chalk.red(`Error checking migrations table: ${error}`));
      return false;
    }
  }
} 