import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { DatabaseAdapter } from "./adapters";
import { defineConfig } from "../type";

export interface ColumnDefinition {
  type: string;
  nullable: boolean;
  default?: string;
  maxLength?: number | null;
}

export interface TableDefinition {
  [columnName: string]: ColumnDefinition;
}

export interface SchemaDefinition {
  [tableName: string]: TableDefinition;
}

export interface ColumnChange {
  type: 'added' | 'removed' | 'modified';
  definition?: ColumnDefinition;
  old?: ColumnDefinition;
  new?: ColumnDefinition;
}

export interface TableDifference {
  type: 'added' | 'removed' | 'modified';
  schema?: TableDefinition;
  changes?: Record<string, ColumnChange>;
}

export interface SchemaDifferences {
  [tableName: string]: TableDifference;
}

export interface SchemaGeneratorOptions {
  type?: "postgres" | "mysql" | "sqlite";
  migrationDir: string;
  config: ReturnType<typeof defineConfig>;
  schema?: string;
}

/**
 * Base class for schema generators
 * This provides the common interface and shared functionality for all schema generators
 */
export abstract class BaseSchemaGenerator {
  protected migrationDir: string;
  protected config: ReturnType<typeof defineConfig>;
  protected adapter: DatabaseAdapter;
  
  constructor(adapter: DatabaseAdapter, options: SchemaGeneratorOptions) {
    this.adapter = adapter;
    this.migrationDir = options.migrationDir;
    this.config = options.config;
    
    // Ensure migration directory exists
    if (!fs.existsSync(this.migrationDir)) {
      fs.mkdirSync(this.migrationDir, { recursive: true });
    }
  }
  
  /**
   * Main entry point for schema generation
   * This method coordinates the entire schema generation process
   */
  public async generateSchema(): Promise<void> {
    if (!this.config?.collections) {
      console.log('No collections found in config');
      return;
    }
    
    try {
      // Check for pending migrations first
      console.log('Checking for pending migrations before generating schema...');
      const hasPendingMigrations = await this.hasPendingMigrations();
      
      if (hasPendingMigrations) {
        console.log(chalk.yellow("⚠️  Cannot generate schema while pending migrations exist"));
        console.log(chalk.yellow("You need to apply your pending migrations before generating new schema changes."));
        console.log(chalk.green("Run this command to apply pending migrations:"));
        console.log(chalk.green("   npx linkb migrate"));
        console.log(chalk.yellow("This ensures your database schema stays in sync with your changes."));
        return; // Exit without proceeding
      }
      
      const currentSchema = await this.getCurrentDatabaseSchema();
      
      // Generate new schema based on config
      const newSchema = await this.generateNewSchema(this.config);
      
      // Compare schemas and generate migration if needed
      const differences = this.compareSchemas(currentSchema, newSchema);
      if (Object.keys(differences).length > 0) {
        console.log('Schema differences found, generating migration...');
        await this.createMigrationFromDifferences(differences);
      } else {
        console.log('No schema changes needed');
      }
    } catch (error) {
      console.error('Error generating schema:', error);
      throw error;
    }
  }
  
  /**
   * Get current database schema
   */
  protected abstract getCurrentDatabaseSchema(): Promise<SchemaDefinition>;
  
  /**
   * Generate new schema based on collections config
   */
  protected abstract generateNewSchema(config: ReturnType<typeof defineConfig>): Promise<SchemaDefinition>;
  
  /**
   * Compare current and new schemas to identify differences
   */
  protected compareSchemas(current: SchemaDefinition, newSchema: SchemaDefinition): SchemaDifferences {
    const differences: SchemaDifferences = {};

    // Check for new tables
    for (const [tableName, tableSchema] of Object.entries(newSchema)) {
      if (!current[tableName]) {
        differences[tableName] = {
          type: 'added',
          schema: tableSchema
        };
      } else {
        // Check for column changes
        const columnChanges: Record<string, ColumnChange> = {};
        
        for (const [columnName, columnSchema] of Object.entries(tableSchema)) {
          if (!current[tableName][columnName]) {
            columnChanges[columnName] = {
              type: 'added',
              definition: columnSchema
            };
          } else if (JSON.stringify(current[tableName][columnName]) !== JSON.stringify(columnSchema)) {
            columnChanges[columnName] = {
              type: 'modified',
              old: current[tableName][columnName],
              new: columnSchema
            };
          }
        }

        // Check for removed columns
        for (const columnName of Object.keys(current[tableName])) {
          if (!tableSchema[columnName]) {
            columnChanges[columnName] = {
              type: 'removed',
              definition: current[tableName][columnName]
            };
          }
        }

        if (Object.keys(columnChanges).length > 0) {
          differences[tableName] = {
            type: 'modified',
            changes: columnChanges
          };
        }
      }
    }

    // Check for removed tables
    for (const tableName of Object.keys(current)) {
      if (!newSchema[tableName]) {
        differences[tableName] = {
          type: 'removed',
          schema: current[tableName]
        };
      }
    }

    return differences;
  }
  
  /**
   * Create migration file from schema differences
   */
  protected abstract createMigrationFromDifferences(differences: SchemaDifferences): Promise<void>;

  /**
   * Check if a new migration should be created based on content comparison
   */
  protected async shouldCreateMigration(newContent: string): Promise<boolean> {
    try {
      // If no migrations yet, create one
      if (!fs.existsSync(this.migrationDir)) {
        return true;
      }

      // Get existing migration files
      const files = fs.readdirSync(this.migrationDir)
        .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
        .sort((a, b) => b.localeCompare(a)); // Sort descending (latest first)

      if (files.length === 0) {
        return true;
      }

      // Get latest migration file
      const latestMigration = files[0];
      const latestMigrationPath = path.join(this.migrationDir, latestMigration);
      
      // Read latest migration content
      const latestContent = fs.readFileSync(latestMigrationPath, 'utf-8');
      
      // Extract SQL queries from both migrations
      const extractSqlQueries = (content: string): string[] => {
        const result: string[] = [];
        // Match all client.query statements and extract SQL from backticks
        const queryRegex = /client\.query\(`(.*?)`\)/gs;
        let match;
        while ((match = queryRegex.exec(content)) !== null) {
          if (match[1]) {
            result.push(match[1].trim());
          }
        }
        return result;
      };
      
      const normalizeQuery = (query: string): string => {
        // Remove comments
        let normalized = query.replace(/--.*$/gm, '');
        // Standardize whitespace
        normalized = normalized.replace(/\s+/g, ' ').trim();
        return normalized;
      };
      
      const normalizeAndSortQueries = (queries: string[]): string[] => {
        return queries.map(normalizeQuery).sort();
      };
      
      // Compare queries in latest migration to new ones
      const latestQueries = extractSqlQueries(latestContent);
      const newQueries = extractSqlQueries(newContent);
      
      // Debug logging
      console.log('Latest migration queries:');
      latestQueries.forEach(q => console.log(`- ${q}`));
      console.log('New migration queries:');
      newQueries.forEach(q => console.log(`- ${q}`));
      
      // Check query count
      if (latestQueries.length !== newQueries.length) {
        console.log(`Different number of queries: latest=${latestQueries.length}, new=${newQueries.length}`);
        return true;
      }
      
      // Compare raw SQL
      const normalizedLatestQueries = normalizeAndSortQueries(latestQueries);
      const normalizedNewQueries = normalizeAndSortQueries(newQueries);
      
      for (let i = 0; i < normalizedLatestQueries.length; i++) {
        if (normalizedLatestQueries[i] !== normalizedNewQueries[i]) {
          console.log('Found different query:');
          console.log(`Latest: ${normalizedLatestQueries[i]}`);
          console.log(`New: ${normalizedNewQueries[i]}`);
          return true;
        }
      }
      
      console.log(`New migration would be identical to latest: ${latestMigration}`);
      return false;
    } catch (error) {
      console.error('Error checking migration:', error);
      // On error, default to creating a new migration
      return true;
    }
  }

  /**
   * Check if there are pending migrations
   * This checks the database for applied migrations and compares with migration folders
   */
  protected async hasPendingMigrations(): Promise<boolean> {
    try {
      console.log(chalk.blue('Checking database for pending migrations...'));
      
      // Ensure migration directory exists
      if (!fs.existsSync(this.migrationDir)) {
        console.log(chalk.yellow('Migrations directory does not exist.'));
        return false;
      }
      
      // Get all migration folders from the filesystem
      const entries = fs.readdirSync(this.migrationDir, { withFileTypes: true });
      
      // Only look for timestamp-based migration folders (YYYYMMDDHHMMSS format)
      const migrationFolders = entries
        .filter(entry => entry.isDirectory() && 
          (/^\d{14}/.test(entry.name) || /^\d{8}_\d{6}/.test(entry.name)))
        .map(entry => entry.name)
        .sort((a, b) => b.localeCompare(a)); // Sort descending to get latest first
      
      if (migrationFolders.length === 0) {
        console.log(chalk.yellow('No migration folders found.'));
        return false;
      }
      
      // Check if migrations table exists by querying the database
      let migrationsTableExists = false;
      try {
        const checkTableResult = await this.adapter.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'migrations'
          );
        `);
        
        migrationsTableExists = checkTableResult.rows?.[0]?.exists || false;
      } catch (error) {
        console.error(chalk.red(`Error checking migrations table: ${error}`));
        migrationsTableExists = false;
      }
      
      if (!migrationsTableExists) {
        console.log(chalk.yellow('Migrations table does not exist yet.'));
        // If migrations table doesn't exist but we have migration folders, 
        // we should consider those as pending
        return migrationFolders.length > 0;
      }
      
      // Query the database for applied migrations
      const appliedMigrationsResult = await this.adapter.query(`
        SELECT name FROM migrations ORDER BY id DESC
      `);
      
      const appliedMigrations = appliedMigrationsResult.rows?.map((row: { name: string }) => row.name) || [];
      console.log(chalk.blue(`Found ${appliedMigrations.length} applied migrations in database.`));
      
      // Find pending migrations (those in migrationFolders but not in appliedMigrations)
      const pendingMigrations = migrationFolders.filter(name => !appliedMigrations.includes(name));
      
      const hasPending = pendingMigrations.length > 0;
      console.log(chalk.blue(`Found ${pendingMigrations.length} pending migrations.`));
      
      if (hasPending) {
        console.log(chalk.yellow('Pending migrations:'));
        pendingMigrations.forEach(name => {
          console.log(chalk.yellow(`  - ${name}`));
        });
      }
      
      return hasPending;
    } catch (error) {
      console.error(chalk.red(`Error checking for pending migrations: ${error}`));
      return false; // Assume no pending migrations in case of error
    }
  }
} 