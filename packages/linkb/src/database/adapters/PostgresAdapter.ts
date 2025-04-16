import chalk from 'chalk';
import { BaseAdapter } from './BaseAdapter';
import type { MigrationOptions } from './types';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import fs from 'node:fs';
import type { defineConfig } from '@linkbcms/core';
import { DatabaseSchema } from '../schema';
import { spawn } from 'node:child_process';

export interface PostgresConfig {
  connectionString?: string;
  schemaDir?: string;
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
  private db: NodePgDatabase<Record<string, never>> & {
    $client: pg.Client;
  };
  private schema: string;

  constructor(config: PostgresConfig) {
    super(config);
    this.tableName = config.tableName || '';
    this.schema = config.schema || 'public';

    // For Supabase, we need to ensure SSL is enabled if not explicitly set
    const sslConfig =
      config.ssl === undefined
        ? { rejectUnauthorized: false } // Default for Supabase
        : config.ssl;

    // Create PostgreSQL client
    const client = new pg.Client({
      connectionString: config.connectionString,
      ssl: sslConfig,
    });

    this.db = drizzle(client);
  }

  /**
   * Initialize the adapter
   */
  public async initialize(): Promise<void> {}

  /**
   * Test database connection
   * @returns Promise that resolves to true if connection is successful, false otherwise
   */
  public async testConnection(): Promise<boolean> {
    try {
      // Check if the client is already connected by attempting a simple query
      // If it fails, we'll try to connect first
      try {
        await this.db.$client.query('SELECT 1 as connection_test');
      } catch (connectionError) {
        // If query fails, try to connect
        await this.db.$client.connect();
      }

      // Execute a simple query to test the connection
      const result = await this.db.$client.query('SELECT 1 as test');

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
      if (!fs.existsSync(this.schemaDir)) {
        fs.mkdirSync(this.schemaDir, { recursive: true });
        console.log(
          chalk.yellow(`Created migrations directory: ${this.schemaDir}`),
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
      await this.db.$client.end();
    } catch (error) {
      console.error(chalk.red(`Error closing database connection: ${error}`));
    }
  }

  /**
   * Run drizzle-kit command interactively to allow for selection prompts
   */
  private runDrizzleKitInteractive(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(chalk.blue(`Executing interactively: ${command}`));

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
          console.log(chalk.green('Command completed successfully'));
          resolve();
        } else {
          console.error(chalk.red(`Command failed with code ${code}`));
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
        console.log(
          chalk.yellow(
            `Config file ${configPath} not found, creating temporary config...`,
          ),
        );
        actualConfigPath = 'drizzle.config.temp.ts';
        tempConfig = true;

        // Create a TypeScript drizzle-kit config file
        const configContent = `
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "${this.schemaDir}/schema.ts",
  out: "../../${this.migrationDir}",
  dbCredentials: {
    url: "${
      this.connectionString ||
      'postgresql://postgres:postgres@localhost:5432/postgres'
    }"
  },
  verbose: true,
  strict: true,
});
`;

        fs.writeFileSync(actualConfigPath, configContent);
        console.log(
          chalk.blue(`Created temporary config file at ${actualConfigPath}`),
        );
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

        console.log(chalk.green('Migration completed successfully'));
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
