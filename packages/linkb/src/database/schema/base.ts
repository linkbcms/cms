import { defineConfig } from "../type";
import path from 'path';
import fs from 'fs';

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
  schemaDir: string;
  migrationDir: string;
}

/**
 * Base class for schema generators
 * This provides the common interface and shared functionality for all schema generators
 */
export abstract class BaseSchemaGenerator {
  protected schemaDir: string;
  protected migrationDir: string;
  
  constructor(options: SchemaGeneratorOptions) {
    this.schemaDir = options.schemaDir;
    this.migrationDir = options.migrationDir;
    
    // Ensure migration directory exists
    if (!fs.existsSync(this.migrationDir)) {
      fs.mkdirSync(this.migrationDir, { recursive: true });
    }
  }
  
  /**
   * Initialize the generator
   * This should establish any necessary database connections
   */
  public abstract initialize(): Promise<void>;
  
  /**
   * Generate schema based on configuration and create migrations if needed
   */
  public async generateSchema(config: ReturnType<typeof defineConfig>): Promise<void> {
    if (!config?.collections) {
      console.log('No collections found in config');
      return;
    }
    
    try {
      // Get current database schema
      const currentSchema = await this.getCurrentDatabaseSchema();
      
      // Generate new schema based on config
      const newSchema = await this.generateNewSchema(config);
      
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
} 