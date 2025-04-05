import { BaseDatabaseAdapter } from './abstract';

/**
 * SQL-specific database adapter
 * Contains methods and properties specific to SQL databases
 */
export abstract class SqlDatabaseAdapter extends BaseDatabaseAdapter {
  /**
   * Get table and column information from a SQL database
   */
  public abstract getTableAndColumnInfo(): Promise<any>;
  
  /**
   * Generate SQL for creating a table
   */
  public abstract generateCreateTableSql(tableName: string, columns: Record<string, any>): string;
  
  /**
   * Generate SQL for altering a table
   */
  public abstract generateAlterTableSql(tableName: string, changes: Record<string, any>): string[];
} 