import chalk from 'chalk';
import { BaseAdapter } from './BaseAdapter';
import { MigrationOptions } from './types';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Define schema for migrations table
const MIGRATIONS_TABLE = {
  table: 'linkb_migrations',
  columns: {
    id: 'id',
    name: 'name',
    batch: 'batch',
    executedAt: 'executed_at'
  }
};

interface PostgresConfig {
  connectionString?: string;
  migrationDir?: string;
  tableName?: string;
  ssl?: boolean;
  schema?: string;
}

/**
 * PostgreSQL database adapter using Drizzle ORM
 * Compatible with Supabase
 */
export class PostgresAdapter extends BaseAdapter {
  private client: Client;
  private db: any; // Drizzle ORM instance
  private schema: string;

  constructor(config: PostgresConfig) {
    super(config);
    this.tableName = config.tableName || MIGRATIONS_TABLE.table;
    this.schema = config.schema || 'public';
    
    // For Supabase, we need to ensure SSL is enabled if not explicitly set
    const sslConfig = config.ssl === undefined ? 
      { rejectUnauthorized: false } : // Default for Supabase
      config.ssl;
    
    // Create PostgreSQL client - only use connectionString
    this.client = new Client({
      connectionString: config.connectionString,
      ssl: sslConfig
    });
  }

  /**
   * Initialize the adapter
   */
  public async initialize(): Promise<void> {
    try {
      console.log(chalk.blue(`Initializing PostgreSQL adapter with Drizzle ORM (schema: ${this.schema})`));
      
      // Connect to PostgreSQL
      await this.client.connect();
      
      // Initialize Drizzle ORM
      this.db = drizzle(this.client);
      
      // Create schema if it doesn't exist (helpful for Supabase custom schemas)
      if (this.schema !== 'public') {
        await this.client.query(`CREATE SCHEMA IF NOT EXISTS "${this.schema}"`);
      }
      
      // Create migrations table if it doesn't exist
      await this.client.query(`
        CREATE TABLE IF NOT EXISTS "${this.schema}"."${this.tableName}" (
          "${MIGRATIONS_TABLE.columns.id}" SERIAL PRIMARY KEY,
          "${MIGRATIONS_TABLE.columns.name}" VARCHAR(255) NOT NULL,
          "${MIGRATIONS_TABLE.columns.batch}" INTEGER NOT NULL,
          "${MIGRATIONS_TABLE.columns.executedAt}" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log(chalk.green('PostgreSQL adapter initialized'));
      
      // For Supabase, check if we're actually connected to a Supabase instance
      try {
        const result = await this.client.query(`
          SELECT setting FROM pg_settings WHERE name = 'server_version'
        `);
        console.log(chalk.blue(`Connected to PostgreSQL ${result.rows[0].setting}`));
        
        // Check for Supabase extensions
        const pgStatStatementsResult = await this.client.query(`
          SELECT EXISTS (
            SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
          )
        `);
        
        if (pgStatStatementsResult.rows[0].exists) {
          console.log(chalk.blue('Detected Supabase environment (pg_stat_statements extension)'));
        }
      } catch (error) {
        // Ignore errors here, just for informational purposes
      }
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.error(chalk.red('Connection refused. Please check:'));
        console.error(chalk.yellow('1. Database server is running'));
        console.error(chalk.yellow('2. Connection string is correct'));
        console.error(chalk.yellow('3. Network allows connection to the database'));
        console.error(chalk.yellow(`Connection error: ${error.message}`));
      }
      throw error;
    }
  }

  /**
   * Run migrations
   */
  public async migrate(options?: MigrationOptions): Promise<void> {
    try {
      const migrationFiles = await this.loadMigrationFiles();
      
      console.log(chalk.blue(`Found ${migrationFiles.length} migration files`));
      
      // Get already executed migrations
      const result = await this.client.query(`
        SELECT "${MIGRATIONS_TABLE.columns.name}" 
        FROM "${this.schema}"."${this.tableName}" 
        ORDER BY "${MIGRATIONS_TABLE.columns.name}"
      `);
      
      const executedMigrations = result.rows.map(row => row[MIGRATIONS_TABLE.columns.name]);
      
      // Get latest batch
      const batchResult = await this.client.query(`
        SELECT MAX("${MIGRATIONS_TABLE.columns.batch}") as latest_batch 
        FROM "${this.schema}"."${this.tableName}"
      `);
      
      const latestBatch = batchResult.rows[0]?.latest_batch || 0;
      const newBatch = latestBatch + 1;
      
      // Filter migrations that haven't been executed yet
      const pendingMigrations = migrationFiles.filter(migration => 
        !executedMigrations.includes(migration.name)
      );
      
      if (pendingMigrations.length === 0) {
        console.log(chalk.green('No pending migrations'));
        return;
      }
      
      console.log(chalk.blue(`Running ${pendingMigrations.length} migrations`));
      
      // Run migrations that haven't been executed yet
      for (const migration of pendingMigrations) {
        console.log(chalk.blue(`Running migration: ${migration.name}`));
        
        // Handle JSON migrations by converting them to TypeScript migrations
        if (migration.type === 'json') {
          const tsPath = await this.convertJsonToMigration(migration.path);
          // Update the migration path to the newly created TypeScript file
          migration.path = tsPath;
          migration.type = 'code';
        }
        
        // Execute migration
        try {
          // For dynamic import in Node.js we need to resolve the path
          const migrationPath = path.resolve(migration.path);
          const migrationModule = await import(migrationPath);
          
          // Begin transaction
          await this.client.query('BEGIN');
          
          try {
            // Pass both db and client to the migration
            await migrationModule.up({
              db: this.db,
              client: this.client,
              schema: this.schema
            });
            
            // Record migration
            await this.client.query(`
              INSERT INTO "${this.schema}"."${this.tableName}" ("${MIGRATIONS_TABLE.columns.name}", "${MIGRATIONS_TABLE.columns.batch}")
              VALUES ($1, $2)
            `, [migration.name, newBatch]);
            
            // Commit transaction
            await this.client.query('COMMIT');
            
            console.log(chalk.green(`Migration ${migration.name} completed`));
          } catch (error) {
            // Rollback transaction
            await this.client.query('ROLLBACK');
            
            console.error(chalk.red(`Error running migration ${migration.name}: ${error}`));
            throw error;
          }
        } catch (importError) {
          console.error(chalk.red(`Error importing migration ${migration.name}: ${importError}`));
          throw importError;
        }
      }
      
      console.log(chalk.green('All migrations completed successfully'));
    } catch (error) {
      console.error(chalk.red(`Error running migrations: ${error}`));
      throw error;
    }
  }

  /**
   * Rollback migrations
   */
  public async rollback(options?: MigrationOptions): Promise<void> {
    try {
      // Get latest batch
      const batchResult = await this.client.query(`
        SELECT MAX("${MIGRATIONS_TABLE.columns.batch}") as latest_batch 
        FROM "${this.schema}"."${this.tableName}"
      `);
      
      const latestBatch = batchResult.rows[0]?.latest_batch || 0;
      
      if (latestBatch === 0) {
        console.log(chalk.yellow('No migrations to roll back'));
        return;
      }
      
      // Get migrations in the latest batch
      const result = await this.client.query(`
        SELECT "${MIGRATIONS_TABLE.columns.name}" 
        FROM "${this.schema}"."${this.tableName}"
        WHERE "${MIGRATIONS_TABLE.columns.batch}" = $1
        ORDER BY "${MIGRATIONS_TABLE.columns.id}" DESC
      `, [latestBatch]);
      
      const migrationsToRollback = result.rows.map(row => row[MIGRATIONS_TABLE.columns.name]);
      
      if (migrationsToRollback.length === 0) {
        console.log(chalk.yellow('No migrations to roll back'));
        return;
      }
      
      console.log(chalk.blue(`Rolling back ${migrationsToRollback.length} migrations from batch ${latestBatch}`));
      
      // Roll back migrations in reverse order
      for (const migrationName of migrationsToRollback) {
        console.log(chalk.blue(`Rolling back migration: ${migrationName}`));
        
        // Find migration file
        const migrationFiles = await this.loadMigrationFiles();
        const migration = migrationFiles.find(m => m.name === migrationName);
        
        if (!migration) {
          console.warn(chalk.yellow(`Migration ${migrationName} not found, skipping`));
          continue;
        }
        
        // Handle JSON migrations by converting them to TypeScript migrations
        if (migration.type === 'json') {
          const tsPath = await this.convertJsonToMigration(migration.path);
          // Update the migration path to the newly created TypeScript file
          migration.path = tsPath;
        }
        
        // Execute rollback
        try {
          // For dynamic import in Node.js we need to resolve the path
          const migrationPath = path.resolve(migration.path);
          const migrationModule = await import(migrationPath);
          
          // Begin transaction
          await this.client.query('BEGIN');
          
          try {
            // Pass both db and client to the migration
            await migrationModule.down({
              db: this.db,
              client: this.client,
              schema: this.schema
            });
            
            // Remove migration record
            await this.client.query(`
              DELETE FROM "${this.schema}"."${this.tableName}"
              WHERE "${MIGRATIONS_TABLE.columns.name}" = $1 AND "${MIGRATIONS_TABLE.columns.batch}" = $2
            `, [migrationName, latestBatch]);
            
            // Commit transaction
            await this.client.query('COMMIT');
            
            console.log(chalk.green(`Rolled back migration ${migrationName}`));
          } catch (error) {
            // Rollback transaction
            await this.client.query('ROLLBACK');
            
            console.error(chalk.red(`Error rolling back migration ${migrationName}: ${error}`));
            throw error;
          }
        } catch (importError) {
          console.error(chalk.red(`Error importing migration ${migrationName}: ${importError}`));
          throw importError;
        }
      }
      
      console.log(chalk.green(`Successfully rolled back batch ${latestBatch}`));
    } catch (error) {
      console.error(chalk.red(`Error rolling back migrations: ${error}`));
      throw error;
    }
  }

  /**
   * Get migration status
   */
  public async status(options?: MigrationOptions): Promise<{ name: string; status: 'pending' | 'applied'; batch?: number }[]> {
    try {
      const migrationFiles = await this.loadMigrationFiles();
      
      // Get executed migrations
      const result = await this.client.query(`
        SELECT "${MIGRATIONS_TABLE.columns.name}", "${MIGRATIONS_TABLE.columns.batch}" 
        FROM "${this.schema}"."${this.tableName}" 
        ORDER BY "${MIGRATIONS_TABLE.columns.name}"
      `);
      
      // Create a map with the correct types
      const executedMigrations = new Map<string, number>();
      
      // Populate the map with database results
      for (const row of result.rows) {
        executedMigrations.set(
          row[MIGRATIONS_TABLE.columns.name],
          Number(row[MIGRATIONS_TABLE.columns.batch])
        );
      }
      
      // Return status of all migrations
      return migrationFiles.map(migration => ({
        name: migration.name,
        status: executedMigrations.has(migration.name) ? 'applied' : 'pending',
        batch: executedMigrations.get(migration.name)
      }));
    } catch (error) {
      console.error(chalk.red(`Error getting migration status: ${error}`));
      throw error;
    }
  }
  
  /**
   * Create a new migration file using the Drizzle ORM format
   */
  public async createMigration(name: string, options?: { dir?: string }): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
    const fileName = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.ts`;
    const dirPath = options?.dir || this.migrationDir;
    const filePath = path.join(dirPath, fileName);
    
    // Make sure the directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Create migration file template
    const template = `/**
 * Migration: ${name}
 * Timestamp: ${new Date().toISOString()}
 */

/**
 * Run the migration
 * @param {Object} context - Migration context
 * @param {Object} context.db - Drizzle ORM instance
 * @param {Object} context.client - PostgreSQL client
 * @param {string} context.schema - Database schema
 */
export async function up({ db, client, schema }) {
  // Use 'client' for raw SQL queries:
  // await client.query(\`CREATE TABLE "my_table" (...)\`);
  
  // Or use 'db' for Drizzle ORM operations
}

/**
 * Rollback the migration
 * @param {Object} context - Migration context
 * @param {Object} context.db - Drizzle ORM instance
 * @param {Object} context.client - PostgreSQL client
 * @param {string} context.schema - Database schema
 */
export async function down({ db, client, schema }) {
  // Rollback logic here
}
`;
    
    fs.writeFileSync(filePath, template);
    console.log(chalk.green(`Created migration: ${filePath}`));
    
    return filePath;
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    try {
      await this.client.end();
    } catch (error) {
      console.error(chalk.red(`Error closing database connection: ${error}`));
    }
  }
} 