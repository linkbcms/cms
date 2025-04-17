import type { DatabaseAdapter, MigrationOptions } from './types';
import type { defineConfig } from '@linkbcms/core';
import type { PostgresConfig } from './PostgresAdapter';

/**
 * Migration file information
 */
export interface MigrationFile {
  name: string; // Migration name (with timestamp prefix)
  path: string; // Full path to the migration file
  folder?: string; // Folder containing the migration (if using folder structure)
}

/**
 * Base adapter implementation with common functionality
 */
export abstract class BaseAdapter implements DatabaseAdapter {
  protected schemaDir: string;
  protected migrationDir: string;
  protected tableName: string;
  protected connectionString: string;

  constructor(config: PostgresConfig) {
    this.connectionString = config.connectionString || '';
    this.schemaDir = config.schemaDir || 'schema';
    this.migrationDir = config.migrationDir || 'migration';
    this.tableName = config.tableName || 'migrations';
  }

  /**
   * Initialize the adapter
   */
  public abstract initialize(): Promise<void>;

  /**
   * Test database connection
   * @returns Promise that resolves to true if connection is successful, false otherwise
   */
  public abstract testConnection(): Promise<boolean>;

  /**
   * Generate schema
   */
  public abstract generateSchema(
    config: ReturnType<typeof defineConfig>,
  ): Promise<void>;

  /**
   * Run migrations
   */
  public abstract migrate(options?: MigrationOptions): Promise<void>;

  /**
   * Close database connection
   */
  public abstract close(): Promise<void>;
}
