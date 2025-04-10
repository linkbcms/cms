/**
 * Database connection adapter interface
 * This defines the common interface for all database connections
 */
export interface DatabaseAdapter {
  
  /**
   * Get the database schema
   */
  getSchema(): string;
  
  /**
   * Close the database connection
   * Optional: Not all adapters need to implement closing logic
   */
  close?(): Promise<void>;
}

/**
 * Base database adapter with common functionality
 * This provides shared implementation details for specific database adapters
 */
export abstract class BaseDatabaseAdapter implements DatabaseAdapter {
  protected schema: string;
  
  constructor(schema: string = "public") {
    this.schema = schema;
    console.log(`Database adapter created for schema: ${this.schema}`);
  }
  
  /**
   * Get the database schema name
   */
  public getSchema(): string {
    return this.schema;
  }
} 