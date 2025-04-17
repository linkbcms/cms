import type { DatabaseAdapter, SupportedDatabase } from './types';
import { PostgresAdapter } from './PostgresAdapter';

// Database type mapping to standardized types
const DB_TYPE_MAPPING: Record<string, string> = {
  // PostgreSQL and its variations
  postgres: 'postgres',
  postgresql: 'postgres',
  supabase: 'postgres',
  vercelpostgres: 'postgres',
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

    // Supabase-specific configuration
    if (type.toLowerCase() === 'supabase') {
      enhancedConfig.ssl =
        enhancedConfig.ssl === undefined
          ? { rejectUnauthorized: false }
          : enhancedConfig.ssl;
      console.log('Using Supabase-specific configuration');
    }

    // Vercel Postgres specific configuration
    if (type.toLowerCase() === 'vercelpostgres') {
      enhancedConfig.ssl =
        enhancedConfig.ssl === undefined ? true : enhancedConfig.ssl;
      console.log('Using Vercel Postgres-specific configuration');
    }

    // Neon specific configuration
    if (type.toLowerCase() === 'neon') {
      enhancedConfig.ssl =
        enhancedConfig.ssl === undefined ? true : enhancedConfig.ssl;
      console.log('Using Neon-specific configuration');
    }

    // Create the appropriate adapter based on the normalized type
    switch (normalizedType) {
      case 'postgres':
        return new PostgresAdapter(enhancedConfig);
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
