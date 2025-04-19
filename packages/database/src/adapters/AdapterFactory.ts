import type { DatabaseAdapter, SupportedDatabase } from './types';
import { PostgresAdapter, type PostgresConfig } from './PostgresAdapter';

// Database type mapping to standardized types
export const DB_TYPE_MAPPING: Record<string, string> = {
  postgres: 'postgres',
  supabase: 'postgres',
  neon: 'postgres',
  // MySQL and its variations
  mysql: 'mysql',
  mariadb: 'mysql',
  // SQLite
  sqlite: 'sqlite',
  sqlite3: 'sqlite',
};

/**
 * Factory for creating database adapters
 */
export class AdapterFactory {
  createAdapter(
    type: SupportedDatabase,
    config: Record<string, unknown>,
  ): DatabaseAdapter {
    // Normalize the database type
    const normalizedType =
      DB_TYPE_MAPPING[type.toLowerCase()] || type.toLowerCase();

    // Add specific configurations based on database provider
    const enhancedConfig = { ...config };
    // Create the appropriate adapter based on the normalized type
    switch (normalizedType) {
      case 'postgres':
        return new PostgresAdapter(enhancedConfig as unknown as PostgresConfig);
      // Add more database types as needed
      // case 'mysql':
      //   return new MySQLAdapter(enhancedConfig);
      // case 'sqlite':
      //   return new SQLiteAdapter(enhancedConfig);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}
