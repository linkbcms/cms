import type { DatabaseAdapter, MigrationOptions } from './types';
import type { defineConfig } from '@linkbcms/core';

/**
 * Base configuration for all database adapters
 */
export interface BaseAdapterConfig {
  connectionString: string;
  schemaDir?: string;
  migrationDir?: string;
}

/**
 * Base adapter implementation with common functionality
 */
export abstract class BaseAdapter implements DatabaseAdapter {
  protected schemaDir: string;
  protected migrationDir: string;
  protected connectionString: string;

  constructor(config: BaseAdapterConfig) {
    this.connectionString = config.connectionString || '';
    this.schemaDir = config.schemaDir || 'schema';
    this.migrationDir = config.migrationDir || 'migration';
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

  /**
   * Reset database
   */
  public abstract resetDatabase(options?: {
    deleteMigrations?: boolean;
    deleteSchema?: boolean;
  }): Promise<void>;
}
