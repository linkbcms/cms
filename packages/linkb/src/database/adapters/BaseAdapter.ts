import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { DatabaseAdapter, MigrationOptions } from './types';

/**
 * Base adapter implementation with common functionality
 */
export abstract class BaseAdapter implements DatabaseAdapter {
  protected migrationDir: string;
  protected tableName: string;
  protected config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
    this.migrationDir = config.migrationDir || 'migrations';
    this.tableName = config.tableName || 'migrations';
  }

  /**
   * Initialize the adapter
   */
  public abstract initialize(): Promise<void>;

  /**
   * Run migrations
   */
  public abstract migrate(options?: MigrationOptions): Promise<void>;

  /**
   * Rollback migrations
   */
  public abstract rollback(options?: MigrationOptions): Promise<void>;

  /**
   * Get migration status
   */
  public abstract status(options?: MigrationOptions): Promise<{ name: string; status: 'pending' | 'applied'; batch?: number }[]>;

  /**
   * Create a new migration file
   */
  public abstract createMigration(name: string, options?: { dir?: string }): Promise<string>;

  /**
   * Close database connection
   */
  public abstract close(): Promise<void>;

  /**
   * Load migration files from the migration directory
   * Supports both .ts/.js files and .json files
   */
  protected async loadMigrationFiles(): Promise<{ name: string; path: string; type: 'code' | 'json' }[]> {
    const migrationFiles: { name: string; path: string; type: 'code' | 'json' }[] = [];
    try {
      // Create migration directory if it doesn't exist
      if (!fs.existsSync(this.migrationDir)) {
        fs.mkdirSync(this.migrationDir, { recursive: true });
        console.log(chalk.yellow(`Created migrations directory: ${this.migrationDir}`));
        return [];
      }

      const files = fs.readdirSync(this.migrationDir);

      for (const file of files) {
        // Handle TypeScript/JavaScript files
        if (file.endsWith('.js') || file.endsWith('.ts')) {
          // Extract the name without extension and timestamp
          const fullName = file.replace(/\.(js|ts)$/, '');
          
          // If the filename starts with a timestamp (YYYYMMDDHHMMSS_), extract just the name part
          const nameMatch = fullName.match(/^\d{14}_(.+)$/);
          const name = nameMatch ? nameMatch[1] : fullName;
          
          migrationFiles.push({
            name: fullName, // Use full name with timestamp for uniqueness
            path: path.join(this.migrationDir, file),
            type: 'code'
          });
        }
        // Handle JSON files
        else if (file.endsWith('.json')) {
          const fullName = file.replace(/\.json$/, '');
          
          // If the filename doesn't start with a timestamp, add one
          const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
          const hasTimestamp = /^\d{14}_/.test(fullName);
          const name = hasTimestamp ? fullName : `${timestamp}_${fullName}`;
          
          migrationFiles.push({
            name: name,
            path: path.join(this.migrationDir, file),
            type: 'json'
          });
        }
      }
      
      // Sort migrations by name (which includes timestamp)
      return migrationFiles.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error(chalk.red(`Error loading migration files: ${error}`));
      return [];
    }
  }

  /**
   * Convert JSON migration file to a TypeScript migration file
   */
  protected async convertJsonToMigration(jsonPath: string): Promise<string> {
    try {
      // Read the JSON file
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      const migration = JSON.parse(jsonContent);

      // Extract the name and timestamp
      const fileName = path.basename(jsonPath, '.json');
      const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
      
      // Create a new filename with timestamp if it doesn't have one
      const hasTimestamp = /^\d{14}_/.test(fileName);
      const migrationName = hasTimestamp ? fileName : `${timestamp}_${fileName}`;
      
      // Create the migration file path
      const migrationFilePath = path.join(this.migrationDir, `${migrationName}.ts`);
      
      // Create the migration file content from the JSON
      const migrationContent = this.generateMigrationFromJson(migration, migrationName);
      
      // Write the migration file
      fs.writeFileSync(migrationFilePath, migrationContent);
      
      console.log(chalk.green(`Converted JSON migration to TypeScript: ${migrationFilePath}`));
      
      return migrationFilePath;
    } catch (error) {
      console.error(chalk.red(`Error converting JSON migration: ${error}`));
      throw error;
    }
  }

  /**
   * Generate TypeScript migration content from JSON
   */
  protected generateMigrationFromJson(json: any, name: string): string {
    // Extract up and down SQL queries from JSON
    const upQueries = Array.isArray(json.up) ? json.up : [json.up];
    const downQueries = Array.isArray(json.down) ? json.down : [json.down];
    
    // Generate up function
    const upFunction = upQueries.map((query: string) => `  await client.query(\`${query}\`);`).join('\n  ');
    
    // Generate down function
    const downFunction = downQueries.map((query: string) => `  await client.query(\`${query}\`);`).join('\n  ');
    
    // Create the migration file content
    return `/**
 * Migration: ${name}
 * Timestamp: ${new Date().toISOString()}
 * Auto-generated from JSON
 */

/**
 * Run the migration
 * @param {Object} context - Migration context
 * @param {Object} context.db - Drizzle ORM instance
 * @param {Object} context.client - Database client
 * @param {string} context.schema - Database schema
 */
export async function up({ db, client, schema }) {
${upFunction}
}

/**
 * Rollback the migration
 * @param {Object} context - Migration context
 * @param {Object} context.db - Drizzle ORM instance
 * @param {Object} context.client - Database client
 * @param {string} context.schema - Database schema
 */
export async function down({ db, client, schema }) {
${downFunction}
}
`;
  }

  protected schemaToSql(json: any, name: string) {

  }
} 