import chalk from 'chalk';
import { BaseAdapter, type BaseAdapterConfig } from './BaseAdapter';
import type { MigrationOptions } from './types';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import fs from 'node:fs';
import type { defineConfig } from '@linkbcms/core';
import { DatabaseSchema } from '../schema';
import { spawn } from 'node:child_process';

/**
 * PostgreSQL database adapter configuration
 */
export interface PostgresConfig extends BaseAdapterConfig {
  schema: string;
}

/**
 * PostgreSQL database adapter using Drizzle ORM
 * Compatible with Supabase
 */
export class PostgresAdapter extends BaseAdapter {
  private db: NodePgDatabase<Record<string, never>>;
  private client: pg.Client;
  private schema: string;

  constructor(config: PostgresConfig) {
    super(config);
    this.schema = config.schema;

    // Create PostgreSQL client
    this.client = new pg.Client({
      connectionString: config.connectionString,
    });

    this.db = drizzle(this.client);
  }

  /**
   * Initialize the adapter
   */
  public async initialize(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Test database connection
   * @returns Promise that resolves to true if connection is successful, false otherwise
   */
  public async testConnection(): Promise<boolean> {
    try {
      // Execute a simple query to test the connection
      await this.client.query('SELECT 1');
      console.log(chalk.green('PostgreSQL connection test successful'));
      return true;
    } catch (error) {
      console.error(chalk.red(`PostgreSQL connection test failed: ${error}`));
      return false;
    }
  }

  /**
   * Generate schema and create migrations if needed
   */
  public async generateSchema(
    config: ReturnType<typeof defineConfig>,
  ): Promise<void> {
    try {
      if (!config?.collections) {
        console.log(chalk.yellow('No collections found in config'));
        return;
      }

      // Use the static factory method to create a PostgreSQL schema generator
      const schema = DatabaseSchema.forPostgres({
        schemaDir: this.schemaDir,
        config: config,
        schema: this.schema,
      });

      await schema.generateSchema();
    } catch (error) {
      console.error(chalk.red('Error generating schema:'), error);
      throw error;
    }
  }

  /**
   * Run migrations using drizzle-kit
   * @param options Migration options
   */
  public async migrate(
    options?: MigrationOptions & {
      configPath?: string;
      dryRun?: boolean;
      verbose?: boolean;
      schemaPath?: string;
    },
  ): Promise<void> {
    try {
      console.log(chalk.blue('Running migrations...'));

      // Check if migrations directory exists
      if (!fs.existsSync(this.migrationDir)) {
        fs.mkdirSync(this.migrationDir, { recursive: true });
        console.log(
          chalk.yellow(`Created migrations directory: ${this.migrationDir}`),
        );
      }

      // Always use drizzle-kit for migrations
      await this.runDrizzleKitMigrate({
        configPath: options?.configPath,
        dryRun: options?.dryRun,
        verbose: options?.verbose,
        schemaPath: options?.schemaPath,
      });
    } catch (error) {
      console.error(chalk.red(`Error running migrations: ${error}`));
      throw error;
    }
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

  /**
   * Reset database by dropping all tables
   * @param options Options for resetting the database
   * @returns Promise that resolves when the reset is complete
   */
  public async resetDatabase(options?: {
    deleteMigrations?: boolean;
    deleteSchema?: boolean;
  }): Promise<void> {
    try {
      console.log(chalk.blue('Resetting database...'));

      // Get the schema
      const schemaName = this.schema || 'public';

      // Drop all tables in the schema
      const tablesQuery = `
        SELECT tablename FROM pg_tables 
        WHERE schemaname = $1;
      `;

      const tablesResult = await this.client.query(tablesQuery, [schemaName]);
      const tables = tablesResult.rows.map((row) => row.tablename);

      if (tables.length === 0) {
        console.log(chalk.yellow('No tables found in the database to reset.'));
      } else {
        console.log(chalk.blue(`Dropping ${tables.length} tables...`));

        // Drop all tables in one transaction
        await this.client.query('BEGIN;');

        for (const table of tables) {
          console.log(chalk.yellow(`Dropping table: ${schemaName}.${table}`));
          await this.client.query(
            `DROP TABLE IF EXISTS "${schemaName}"."${table}" CASCADE;`,
          );
        }

        await this.client.query('COMMIT;');
        console.log(chalk.green('All tables have been dropped successfully.'));
      }

      // Handle additional cleanup if requested
      if (options?.deleteMigrations) {
        if (fs.existsSync(this.migrationDir)) {
          console.log(
            chalk.blue(`Removing migration files from ${this.migrationDir}`),
          );
          fs.rmSync(this.migrationDir, { recursive: true, force: true });
          fs.mkdirSync(this.migrationDir, { recursive: true });
          console.log(chalk.green('Migration files removed.'));
        } else {
          console.log(
            chalk.yellow(
              `Migration directory ${this.migrationDir} does not exist.`,
            ),
          );
        }
      }

      if (options?.deleteSchema) {
        if (fs.existsSync(this.schemaDir)) {
          console.log(
            chalk.blue(`Removing schema files from ${this.schemaDir}`),
          );
          fs.rmSync(this.schemaDir, { recursive: true, force: true });
          fs.mkdirSync(this.schemaDir, { recursive: true });
          console.log(chalk.green('Schema files removed.'));
        } else {
          console.log(
            chalk.yellow(`Schema directory ${this.schemaDir} does not exist.`),
          );
        }
      }

      console.log(chalk.green('Database reset completed successfully.'));
    } catch (error) {
      console.log(error);
      console.error(chalk.red(`Error resetting database: ${error}`));
      throw error;
    }
  }

  /**
   * Run drizzle-kit command interactively to allow for selection prompts
   */
  private runDrizzleKitInteractive(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Split the command into command and args
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      // Use spawn to run command interactively
      const process = spawn(cmd, args, {
        stdio: 'inherit', // This connects the child process stdio to the parent
        shell: true, // Use shell to resolve commands like 'npx'
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      process.on('error', (err) => {
        console.error(chalk.red(`Failed to start command: ${err.message}`));
        reject(err);
      });
    });
  }

  /**
   * Run drizzle-kit migrate command
   * This directly runs the drizzle-kit CLI migrate command
   */
  public async runDrizzleKitMigrate(options?: {
    configPath?: string;
    dryRun?: boolean;
    verbose?: boolean;
    schemaPath?: string;
  }): Promise<void> {
    try {
      // Get the config path
      const configPath = options?.configPath || 'drizzle.config.ts';

      // Check if config file exists, if not create a temporary one
      let tempConfig = false;
      let actualConfigPath = configPath;

      if (!fs.existsSync(configPath)) {
        actualConfigPath = 'drizzle.config.temp.ts';
        tempConfig = true;

        const configContent = `
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "${this.schemaDir}/schema.ts",
  out: "${this.migrationDir}",
  dbCredentials: {
    url: "${
      this.connectionString ||
      'postgresql://postgres:postgres@localhost:5432/postgres'
    }"
  },
  verbose: false,
  strict: true,
});
`;
        fs.writeFileSync(actualConfigPath, configContent);
      }

      await this.runDrizzleKitInteractive(
        `npx drizzle-kit generate --config=${actualConfigPath}`,
      );

      try {
        // Build the command
        let command = `npx drizzle-kit migrate --config=${actualConfigPath}`;

        // Add options
        if (options?.dryRun) {
          command += ' --dry-run';
        }

        if (options?.verbose) {
          command += ' --verbose';
        }

        // Run the command interactively to allow for selection prompts
        await this.runDrizzleKitInteractive(command);
      } finally {
        // Clean up temp config if created
        if (tempConfig && fs.existsSync(actualConfigPath)) {
          fs.unlinkSync(actualConfigPath);
        }
      }
    } catch (error) {
      console.log(error);
      console.error(chalk.red(`Error running migration: ${error}`));
      throw error;
    }
  }
}
