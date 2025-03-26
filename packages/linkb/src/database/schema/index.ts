import { defineConfig } from "../type";
import { BaseSchemaGenerator, PostgresSchemaGenerator } from './generators';
import path from 'path';

export interface SchemaGeneratorOptions {
  // Database config
  type?: 'postgres' | 'mysql' | 'sqlite';
  connectionString?: string;
  schema?: string;
  ssl?: boolean;
  
  // Schema and migration paths
  schemaDir?: string;
  migrationDir?: string;
}

/**
 * Generate database schema from collections configuration
 * This will analyze the database structure and create migrations as needed
 * 
 * @param config The CMS configuration with collections
 * @param options Generator options including database connection details
 */
export async function generateSchema(
  config: ReturnType<typeof defineConfig>,
  options: SchemaGeneratorOptions = {}
): Promise<void> {
  // Determine which generator to use based on database type
  const dbType = options.type || 'postgres';
  
  // Set default directories
  const baseDir = process.cwd();
  const schemaDir = options.schemaDir || path.join(baseDir, 'schema');
  const migrationDir = options.migrationDir || path.join(baseDir, 'migrations');
  
  // Create the appropriate schema generator
  let generator: BaseSchemaGenerator;
  
  switch (dbType) {
    case 'postgres':
      generator = new PostgresSchemaGenerator({
        connectionString: options.connectionString,
        schema: options.schema,
        ssl: options.ssl,
        schemaDir,
        migrationDir
      });
      break;
    // Future database support:
    // case 'mysql':
    //   generator = new MySQLSchemaGenerator({...});
    //   break;
    // case 'sqlite':
    //   generator = new SQLiteSchemaGenerator({...});
    //   break;
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
  
  try {
    // Initialize the generator
    await generator.initialize();
    
    // Generate schema and migrations
    await generator.generateSchema(config);
  } catch (error) {
    console.error('Error generating schema:', error);
    throw error;
  } finally {
    // Close database connections
    if (generator && typeof (generator as any).close === 'function') {
      await (generator as any).close();
    }
  }
}

// Re-export all generators for advanced usage
export * from './generators'; 