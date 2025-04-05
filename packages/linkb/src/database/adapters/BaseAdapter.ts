import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { DatabaseAdapter, MigrationOptions } from './types';
import { defineConfig } from "../type";

/**
 * Migration file information
 */
export interface MigrationFile {
  name: string;        // Migration name (with timestamp prefix)
  path: string;        // Full path to the migration file
  folder?: string;     // Folder containing the migration (if using folder structure)
}

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
   * Test database connection
   * @returns Promise that resolves to true if connection is successful, false otherwise
   */
  public abstract testConnection(): Promise<boolean>;

  /**
   * Generate schema
   */
  public abstract generateSchema(config: ReturnType<typeof defineConfig>): Promise<void>;

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
  public abstract status(options?: MigrationOptions): Promise<{ 
    name: string; 
    status: 'pending' | 'applied' | 'rolled-back'; 
    batch?: number;
    executedAt?: Date;
  }[]>;

  /**
   * Close database connection
   */
  public abstract close(): Promise<void>;

  /**
   * Create a new migration folder with the given name
   * @returns The path to the new migration folder and the timestamp
   */
  protected createMigrationFolder(name: string): { folderPath: string; timestamp: string } {
    // Generate a timestamp in YYYYMMDDHHmmss format
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
    
    // Use timestamp as the folder name
    const folderName = `${timestamp}`;
    const folderPath = path.join(this.migrationDir, folderName);
    
    // Create the folder
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    return { folderPath, timestamp };
  }

  /**
   * Load migration files from the migration directory
   * Supports both flat structure and folder-based structure
   */
  protected async loadMigrationFiles(): Promise<MigrationFile[]> {
    const migrationFiles: MigrationFile[] = [];
    try {
      // Create migration directory if it doesn't exist
      if (!fs.existsSync(this.migrationDir)) {
        fs.mkdirSync(this.migrationDir, { recursive: true });
        console.log(chalk.yellow(`Created migrations directory: ${this.migrationDir}`));
        return [];
      }

      const entries = fs.readdirSync(this.migrationDir, { withFileTypes: true });
      
      // First, handle top-level files (legacy flat structure)
      const topLevelFiles = entries.filter(entry => entry.isFile());
      for (const entry of topLevelFiles) {
        const file = entry.name;
        
        // Handle TypeScript/JavaScript files
        if (file.endsWith('.js') || file.endsWith('.ts')) {
          // Extract the name without extension
          const fullName = file.replace(/\.(js|ts)$/, '');
          
          migrationFiles.push({
            name: fullName,
            path: path.join(this.migrationDir, file)
          });
        }
      }
      
      // Then, handle folders (new structure)
      const folders = entries.filter(entry => entry.isDirectory());
      for (const folder of folders) {
        const folderName = folder.name;
        const folderPath = path.join(this.migrationDir, folderName);
        
        // Check if the folder name matches the timestamp pattern (14 digits)
        if (!/^\d{14}$/.test(folderName)) continue;
        
        // Look for migration files within the folder
        const folderFiles = fs.readdirSync(folderPath);
        
        // Try to find index.ts or index.js first
        const migrationFile = folderFiles.find(f => f === 'index.ts' || f === 'index.js') || 
          folderFiles.find(f => f === 'migration.sql' || f === 'sql.ts' || f === 'sql.js') ||
          folderFiles.find(f => f.endsWith('.ts') || f.endsWith('.js'));
        
        if (migrationFile) {
          migrationFiles.push({
            name: folderName,
            path: path.join(folderPath, migrationFile),
            folder: folderPath
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
   * @deprecated This method is only kept for backward compatibility
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
      const hasTimestamp = /^\d{14}$/.test(fileName);
      const migrationName = hasTimestamp ? fileName : timestamp;
      
      // Create a folder for this migration
      const { folderPath } = this.createMigrationFolder(fileName);
      const migrationFilePath = path.join(folderPath, 'index.ts');
      
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