import { AdapterFactory, DB_TYPE_MAPPING } from '../adapters/AdapterFactory';
import type { DatabaseAdapter, SupportedDatabase } from '../adapters/types';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * Union type for all supported database instance types
 * Add more types here as they are implemented
 */
export type DatabaseInstance = NodePgDatabase<Record<string, never>>;
// Add more database types as they are supported
// | MySqlDatabase<Record<string, never>>
// | SqliteDatabase<Record<string, never>>

// Configuration interface for LinkbDb
export interface LinkbDbConfig {
  dbType?: string;
  dbUrl?: string;
  schema?: string;
  [key: string]: unknown;
}

/**
 * Interface to access the internal db property of adapters
 * This is needed because the DatabaseAdapter interface doesn't expose the db property
 */
interface AdapterWithDb {
  db: DatabaseInstance;
}

/**
 * Main database class for Linkb CMS
 */
export class LinkbDb {
  private adapter: DatabaseAdapter | null = null;
  private _db: DatabaseInstance | null = null;
  private dbType: string;
  private adapterFactory: AdapterFactory;
  private initializationPromise: Promise<void>;

  /**
   * Create a new LinkbDb instance
   * Connection is initialized automatically
   */
  constructor(config?: LinkbDbConfig) {
    const dbUrl = config?.dbUrl || process.env.DATABASE_URL;
    const dbType = config?.dbType || process.env.DATABASE_TYPE;

    if (!dbUrl) {
      throw new Error(
        'Database URL is required. Either provide it in the config or set DATABASE_URL environment variable.',
      );
    }

    if (!dbType) {
      throw new Error(
        'Database type is required. Either provide it in the config or set DATABASE_TYPE environment variable.',
      );
    }

    this.dbType = dbType;
    this.adapterFactory = new AdapterFactory();

    // Create the adapter using the factory
    try {
      // Create enhanced config with connection string
      const adapterConfig = {
        ...config,
        connectionString: dbUrl,
      };

      // Use the factory to create the appropriate adapter
      this.adapter = this.adapterFactory.createAdapter(
        dbType as SupportedDatabase,
        adapterConfig,
      );

      // Cast to unknown first to avoid TypeScript errors when accessing a property
      // that isn't defined on the interface but is available at runtime
      const adapterWithDb = this.adapter as unknown as AdapterWithDb;
      this._db = adapterWithDb.db;

      // Always initialize automatically
      this.initializationPromise = this.initializeInternal();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to initialize database: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Internal method to initialize the connection
   */
  private async initializeInternal(): Promise<void> {
    if (!this.adapter) {
      throw new Error('Database adapter not initialized.');
    }

    await this.adapter.initialize();
  }

  /**
   * Get the Drizzle ORM database instance
   */
  get db(): DatabaseInstance {
    if (!this._db) {
      throw new Error('Database not initialized.');
    }

    return this._db;
  }

  /**
   * Wait for initialization to complete
   * You typically don't need to call this as db access automatically handles initialization
   */
  async ready(): Promise<void> {
    await this.initializationPromise;
  }

  /**
   * Get the database type
   */
  getDatabaseType(): string {
    return this.dbType;
  }

  /**
   * Get the normalized database type (postgres, mysql, sqlite)
   */
  getNormalizedDatabaseType(): string {
    return (
      DB_TYPE_MAPPING[this.dbType.toLowerCase()] || this.dbType.toLowerCase()
    );
  }

  /**
   * Get the underlying adapter
   */
  getAdapter(): DatabaseAdapter {
    if (!this.adapter) {
      throw new Error('Database adapter not initialized.');
    }

    return this.adapter;
  }
}

// Singleton instance
let instance: LinkbDb | null = null;

/**
 * Get the database instance
 * Creates a new instance if one doesn't exist
 */
export const linkbDb = (config?: LinkbDbConfig): DatabaseInstance => {
  if (!instance) {
    instance = new LinkbDb(config);
  }
  return instance.db;
};

// Default export
export default linkbDb;
