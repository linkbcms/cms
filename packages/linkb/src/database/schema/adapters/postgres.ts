import { Client } from "pg";
import chalk from 'chalk';
import { defineConfig } from "../../../../type";
import { BaseSchemaGenerator, SchemaDefinition, TableDefinition, SchemaGeneratorOptions } from "../base";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { SqlDatabaseAdapter } from "./base";


export type PostgresConnection = NodePgDatabase<Record<string, never>> & { $client: Client };

export interface PostgresSchemaGeneratorOptions extends SchemaGeneratorOptions {
  db: PostgresConnection;
  schema?: string;
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
    console.log(chalk.blue(`Migrations will be stored in: ${this.schemaDir}`));
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
    
    // Process each collection
    for (const [collectionName, collection] of Object.entries(config.collections)) {
      // Check if collection has a schema
      const collectionSchema = this.getCollectionSchema(collection);
      if (!collectionSchema) continue;
      
      // Handle i18n collections
      const i18nConfig = this.getI18nConfig(collection);
      
      // Create main table - this represents the default locale if i18n is configured
      schema[collectionName] = this.generateTableSchema(collectionSchema);
      
      // If i18n is configured, create tables only for non-default locales
      if (i18nConfig?.locales && i18nConfig.defaultLocale) {
        // Only create locale-specific tables for non-default locales
        const nonDefaultLocales = i18nConfig.locales.filter(locale => locale !== i18nConfig.defaultLocale);
        
        for (const locale of nonDefaultLocales) {
          const localeTableName = `${collectionName}_${locale}`;
          schema[localeTableName] = this.generateTableSchema(collectionSchema);
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
} 