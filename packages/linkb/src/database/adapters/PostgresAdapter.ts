import chalk from "chalk";
import { BaseAdapter, MigrationFile } from "./BaseAdapter";
import { MigrationOptions } from "./types";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import fs from "fs";
import path from "path";
import { defineConfig } from "../../../type";
import { DatabaseSchema } from "../schema";
import { spawn } from "child_process";

// Define schema for migrations table
const MIGRATIONS_TABLE = {
  table: "linkb_migrations",
  columns: {
    id: "id",
    name: "name",
    batch: "batch",
    executedAt: "executed_at",
  },
};

interface PostgresConfig {
  connectionString?: string;
  schemaDir?: string;
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
    $client: Client;
  };
  private schema: string;

  constructor(config: PostgresConfig) {
    super(config);
    this.tableName = config.tableName || MIGRATIONS_TABLE.table;
    this.schema = config.schema || "public";

    // For Supabase, we need to ensure SSL is enabled if not explicitly set
    const sslConfig =
      config.ssl === undefined
        ? { rejectUnauthorized: false } // Default for Supabase
        : config.ssl;

    // Create PostgreSQL client
    const client = new Client({
      connectionString: config.connectionString,
      ssl: sslConfig,
    });

    // Log connection details (hiding sensitive info)
    console.log(
      chalk.blue(`PostgreSQL adapter created with schema: ${this.schema}`)
    );
    console.log(
      chalk.blue(
        `Connection string: ${
          config.connectionString ? "[HIDDEN]" : "not provided"
        }`
      )
    );
    console.log(chalk.blue(`SSL enabled: ${!!sslConfig}`));
    this.db = drizzle(client);
  }

  /**
   * Initialize the adapter
   */
  public async initialize(): Promise<void> {
    try {
      console.log(
        chalk.blue(
          `Initializing PostgreSQL adapter with Drizzle ORM (schema: ${this.schema})`
        )
      );

      // Connect to PostgreSQL
      await this.db.$client.connect();

      // Create schema if it doesn't exist (helpful for Supabase custom schemas)
      if (this.schema !== "public") {
        await this.db.$client.query(
          `CREATE SCHEMA IF NOT EXISTS "${this.schema}"`
        );
      }

      // Create migrations table if it doesn't exist
      await this.db.$client.query(`
        CREATE TABLE IF NOT EXISTS "${this.schema}"."${this.tableName}" (
          "${MIGRATIONS_TABLE.columns.id}" SERIAL PRIMARY KEY,
          "${MIGRATIONS_TABLE.columns.name}" VARCHAR(255) NOT NULL,
          "${MIGRATIONS_TABLE.columns.batch}" INTEGER NOT NULL,
          "${MIGRATIONS_TABLE.columns.executedAt}" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log(chalk.green("PostgreSQL adapter initialized"));

      // Check PostgreSQL version and extensions
      try {
        const result = await this.db.$client.query(`
          SELECT setting FROM pg_settings WHERE name = 'server_version'
        `);

        console.log(
          chalk.blue(`Connected to PostgreSQL ${result.rows[0].setting}`)
        );

        // Check for Supabase extensions
        const pgStatStatementsResult = await this.db.$client.query(`
          SELECT EXISTS (
            SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
          )
        `);

        if (pgStatStatementsResult.rows[0].exists) {
          console.log(
            chalk.blue(
              "Detected Supabase environment (pg_stat_statements extension)"
            )
          );
        }
      } catch (error) {
        // Ignore errors here, just for informational purposes
      }
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.error(chalk.red("Connection refused. Please check:"));
        console.error(chalk.yellow("1. Database server is running"));
        console.error(chalk.yellow("2. Connection string is correct"));
        console.error(
          chalk.yellow("3. Network allows connection to the database")
        );
        console.error(chalk.yellow(`Connection error: ${error.message}`));
      }
      throw error;
    }
  }

  /**
   * Test database connection
   * @returns Promise that resolves to true if connection is successful, false otherwise
   */
  public async testConnection(): Promise<boolean> {
    try {
      // Check if the client is already connected by attempting a simple query
      // If it fails, we'll try to connect first
      try {
        await this.db.$client.query("SELECT 1 as connection_test");
      } catch (connectionError) {
        // If query fails, try to connect
        await this.db.$client.connect();
      }

      // Execute a simple query to test the connection
      const result = await this.db.$client.query("SELECT 1 as test");

      console.log(chalk.green("PostgreSQL connection test successful"));
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
    config: ReturnType<typeof defineConfig>
  ): Promise<void> {
    try {
      if (!config?.collections) {
        console.log(chalk.yellow("No collections found in config"));
        return;
      }

      // Use the static factory method to create a PostgreSQL schema generator
      const schema = DatabaseSchema.forPostgres(this.db, {
        schemaDir: this.schemaDir,
        config: config,
      });

      await schema.generateSchema();
    } catch (error) {
      console.error(chalk.red("Error generating schema:"), error);
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
    }
  ): Promise<void> {
    try {
      console.log(chalk.blue("Running migrations with drizzle-kit..."));

      // Check if migrations directory exists
      if (!fs.existsSync(this.schemaDir)) {
        fs.mkdirSync(this.schemaDir, { recursive: true });
        console.log(
          chalk.yellow(`Created migrations directory: ${this.schemaDir}`)
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
   * Get migration status
   */
  public async status(
    options?: MigrationOptions
  ): Promise<
    {
      name: string;
      status: "pending" | "applied" | "rolled-back";
      batch?: number;
      executedAt?: Date;
    }[]
  > {
    try {
      // Get executed migrations from database
      const result = await this.db.$client.query(`
        SELECT 
          "${MIGRATIONS_TABLE.columns.name}", 
          "${MIGRATIONS_TABLE.columns.batch}",
          "${MIGRATIONS_TABLE.columns.executedAt}"
        FROM "${this.schema}"."${this.tableName}"
        ORDER BY "${MIGRATIONS_TABLE.columns.id}" ASC
      `);

      const executedMigrations = result.rows.map((row) => ({
        name: row[MIGRATIONS_TABLE.columns.name],
        batch: row[MIGRATIONS_TABLE.columns.batch],
        executedAt: row[MIGRATIONS_TABLE.columns.executedAt],
      }));

      // Get all migration files
      const migrationFiles = await this.loadMigrationFiles();

      // Combine and determine status
      const statusList = migrationFiles.map((file) => {
        const executedMigration = executedMigrations.find(
          (m) => m.name === file.name
        );

        // Check if the migration has been rolled back by looking for a .rolled-back file
        let status: "pending" | "applied" | "rolled-back" = "pending";

        if (executedMigration) {
          status = "applied";
        } else if (file.folder) {
          const rolledBackMarker = path.join(file.folder, ".rolled-back");
          if (fs.existsSync(rolledBackMarker)) {
            status = "rolled-back";
          }
        }

        return {
          name: file.name,
          status,
          batch: executedMigration?.batch,
          executedAt: executedMigration?.executedAt,
        };
      });

      // Sort by name
      statusList.sort((a, b) => a.name.localeCompare(b.name));

      // Print status table
      if (statusList.length > 0) {
        console.log(chalk.blue("Migration Status:"));
        console.log(
          chalk.blue(
            "----------------------------------------------------------------------"
          )
        );
        console.log(
          chalk.blue(
            "Name                  | Status      | Batch | Executed At"
          )
        );
        console.log(
          chalk.blue(
            "----------------------------------------------------------------------"
          )
        );

        statusList.forEach((migration) => {
          const name = migration.name.padEnd(22);
          const status = migration.status.padEnd(12);
          const batch = (
            migration.batch ? migration.batch.toString() : "-"
          ).padEnd(7);
          const executedAt = migration.executedAt
            ? new Date(migration.executedAt).toISOString()
            : "-";

          let statusColor;
          switch (migration.status) {
            case "applied":
              statusColor = chalk.green;
              break;
            case "pending":
              statusColor = chalk.yellow;
              break;
            case "rolled-back":
              statusColor = chalk.red;
              break;
            default:
              statusColor = chalk.white;
          }

          console.log(
            `${name} | ${statusColor(status)} | ${batch} | ${executedAt}`
          );
        });

        console.log(
          chalk.blue(
            "----------------------------------------------------------------------"
          )
        );
      } else {
        console.log(chalk.yellow("No migrations found"));
      }

      return statusList;
    } catch (error) {
      console.error(chalk.red(`Error getting migration status: ${error}`));
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
      const parts = command.split(" ");
      const cmd = parts[0];
      const args = parts.slice(1);

      // Use spawn to run command interactively
      const process = spawn(cmd, args, {
        stdio: "inherit", // This connects the child process stdio to the parent
        shell: true, // Use shell to resolve commands like 'npx'
      });

      process.on("close", (code) => {
        if (code === 0) {
          console.log(chalk.green(`Command completed successfully`));
          resolve();
        } else {
          console.error(chalk.red(`Command failed with code ${code}`));
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      process.on("error", (err) => {
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
      console.log(chalk.blue("Running drizzle-kit migrate command..."));

      // Get the config path
      const configPath = options?.configPath || "drizzle.config.ts";

      // Check if config file exists, if not create a temporary one
      let tempConfig = false;
      let actualConfigPath = configPath;

      if (!fs.existsSync(configPath)) {
        console.log(
          chalk.yellow(
            `Config file ${configPath} not found, creating temporary config...`
          )
        );
        actualConfigPath = "drizzle.config.temp.ts";
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
      this.config.connectionString ||
      "postgresql://postgres:postgres@localhost:5432/postgres"
    }"
  },
  verbose: true,
  strict: true,
});
`;

        fs.writeFileSync(actualConfigPath, configContent);
        console.log(
          chalk.blue(`Created temporary config file at ${actualConfigPath}`)
        );
      }

      await this.runDrizzleKitInteractive(
        `npx drizzle-kit generate --config=${actualConfigPath}`
      );

      try {
        // Build the command
        let command = `npx drizzle-kit migrate --config=${actualConfigPath}`;

        // Add options
        if (options?.dryRun) {
          command += " --dry-run";
        }

        if (options?.verbose) {
          command += " --verbose";
        }

        // Run the command interactively to allow for selection prompts
        await this.runDrizzleKitInteractive(command);

        console.log(chalk.green("drizzle-kit migrate completed successfully"));
      } finally {
        // Clean up temp config if created
        if (tempConfig && fs.existsSync(actualConfigPath)) {
          console.log(
            chalk.blue(`Removing temporary config file ${actualConfigPath}`)
          );
          fs.unlinkSync(actualConfigPath);
        }
      }
    } catch (error) {
      console.log(error);
      console.error(chalk.red(`Error running drizzle-kit migrate: ${error}`));
      throw error;
    }
  }
}
