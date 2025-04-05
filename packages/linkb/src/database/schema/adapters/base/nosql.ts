import { BaseDatabaseAdapter } from './abstract';

/**
 * NoSQL-specific database adapter
 * Contains methods and properties specific to NoSQL databases
 */
export abstract class NoSqlDatabaseAdapter extends BaseDatabaseAdapter {
  /**
   * Get collection information from a NoSQL database
   */
  public abstract getCollectionInfo(): Promise<any>;
  
  /**
   * Create a collection in the NoSQL database
   */
  public abstract createCollection(collectionName: string, options?: any): Promise<void>;
  
  /**
   * Create a validator for a NoSQL collection
   */
  public abstract createCollectionValidator(collectionName: string, schema: any): Promise<void>;
} 