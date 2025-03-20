/**
 * Database migration options
 */
export interface MigrationOptions {
  migrationDir?: string;
  tableName?: string;
  schema?: string;
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
   * Run migrations
   */
  migrate(options?: MigrationOptions): Promise<void>;
  
  /**
   * Rollback migrations
   */
  rollback(options?: MigrationOptions): Promise<void>;
  
  /**
   * Get migration status
   */
  status(options?: MigrationOptions): Promise<{ name: string; status: 'pending' | 'applied'; batch?: number }[]>;

  /**
   * Create a new migration file
   */
  createMigration(name: string, options?: { dir?: string }): Promise<string>;

  /**
   * Close the database connection
   */
  close(): Promise<void>;
} 