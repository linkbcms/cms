import { defineConfig } from "../type";

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
export const SUPPORTED_DATABASES = [
  'postgres',       // Standard PostgreSQL
  'postgresql',     // Alternative spelling
  'supabase',       // Supabase (PostgreSQL)
  'vercelpostgres', // Vercel Postgres
  'neon',           // Neon PostgreSQL
  'mysql',          // MySQL (not implemented yet)
  'sqlite'          // SQLite (not implemented yet)
] as const;

/**
 * Database provider type
 */
export type SupportedDatabase = typeof SUPPORTED_DATABASES[number];

/**
 * Database adapter interface
 */
export interface DatabaseAdapter {
  /**
   * Initialize the adapter
   */
  initialize(): Promise<void>;

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
   * Get migration status
   */
  status(options?: MigrationOptions): Promise<{ 
    name: string; 
    status: 'pending' | 'applied' | 'rolled-back'; 
    batch?: number;
    executedAt?: Date;
  }[]>;

  /**
   * Close the database connection
   */
  close(): Promise<void>;
} 