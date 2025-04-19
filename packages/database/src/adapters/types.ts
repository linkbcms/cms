import type { defineConfig } from '@linkbcms/core';
import { DB_TYPE_MAPPING } from './AdapterFactory';

/**
 * Database migration options
 */
export interface MigrationOptions {
  schemaDir?: string;
  tableName?: string;
  schema?: string;
  allowMultiple?: boolean; // Allow running multiple pending migrations at once
}

/**
 * List of supported database providers
 */
export const SUPPORTED_DATABASES = Object.keys(
  DB_TYPE_MAPPING,
) as readonly string[];

/**
 * Database provider type
 */
export type SupportedDatabase = (typeof SUPPORTED_DATABASES)[number];

/**
 * Database adapter interface
 */
export interface DatabaseAdapter {
  /**
   * Initialize the adapter
   */
  initialize(): Promise<unknown>;

  /**
   * Test database connection
   * @returns Promise that resolves to true if connection is successful, false otherwise
   */
  testConnection(): Promise<boolean>;

  /**
   * Generate schema
   */
  generateSchema(config: ReturnType<typeof defineConfig>): Promise<void>;

  /**
   * Run migrations
   */
  migrate(options?: MigrationOptions): Promise<void>;

  /**
   * Reset database by dropping all tables
   * @param options Options for resetting the database
   */
  resetDatabase(options?: {
    deleteMigrations?: boolean;
    deleteSchema?: boolean;
  }): Promise<void>;

  /**
   * Close the database connection
   */
  close(): Promise<void>;
}
