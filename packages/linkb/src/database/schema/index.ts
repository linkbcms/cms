import type { Client } from 'pg';
import type { BaseSchemaGenerator, SchemaGeneratorOptions } from './base';
import { PostgresSchemaGenerator } from './adapters';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * Database schema manager for schema generation and migrations
 * This class uses the appropriate schema generator for the database type
 */
export class DatabaseSchema {
  private schemaGenerator: BaseSchemaGenerator;

  /**
   * Create a schema manager for a PostgreSQL database
   */
  static forPostgres(
    options: Omit<SchemaGeneratorOptions, 'type'>,
  ): DatabaseSchema {
    const pgOptions: SchemaGeneratorOptions = {
      ...options,
      type: 'postgres',
    };

    const schemaGenerator = new PostgresSchemaGenerator({
      ...pgOptions,
    });

    return new DatabaseSchema(schemaGenerator);
  }

  // When adding MySQL support:
  // static forMySQL(db: MySQLConnection, options: Omit<SchemaGeneratorOptions, "type">): DatabaseSchema {
  //   ...
  // }

  /**
   * Create a schema manager with an existing schema generator
   */
  constructor(schemaGenerator: BaseSchemaGenerator) {
    this.schemaGenerator = schemaGenerator;
  }

  /**
   * Generate database schema from collections configuration
   * This will analyze the database structure and create migrations as needed
   */
  async generateSchema(): Promise<void> {
    try {
      await this.schemaGenerator.generateSchema();
    } catch (error) {
      console.error('Error generating schema:', error);
      throw error;
    }
  }
}
