import chalk from "chalk";
import { BaseAdapter, MigrationFile } from "./BaseAdapter";
import { MigrationOptions } from "./types";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import fs from "fs";
import path from "path";
import { defineConfig } from "../type";
import { DatabaseSchema } from "../schema";
import * as pgCore from "drizzle-orm/pg-core";

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

    // Create PostgreSQL client - only use connectionString
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

      // Create migrations table if it doesn't exist - using raw query for now
      // In the future, we can convert this to a proper Drizzle schema once we resolve module resolution issues
      await this.db.$client.query(`
        CREATE TABLE IF NOT EXISTS "${this.schema}"."${this.tableName}" (
          "${MIGRATIONS_TABLE.columns.id}" SERIAL PRIMARY KEY,
          "${MIGRATIONS_TABLE.columns.name}" VARCHAR(255) NOT NULL,
          "${MIGRATIONS_TABLE.columns.batch}" INTEGER NOT NULL,
          "${MIGRATIONS_TABLE.columns.executedAt}" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log(chalk.green("PostgreSQL adapter initialized"));

      // For Supabase, check if we're actually connected to a Supabase instance
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
    config: ReturnType<typeof defineConfig>
  ): Promise<void> {
    try {
      if (!config?.collections) {
        console.log(chalk.yellow("No collections found in config"));
        return;
      }

      // Use the static factory method to create a PostgreSQL schema generator
      const schema = DatabaseSchema.forPostgres(this.db, {
        migrationDir: this.migrationDir,
        config: config,
      });
      
      await schema.generateSchema();
    } catch (error) {
      console.error(chalk.red("Error generating schema:"), error);
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
      const result = await this.db.$client.query(`
        SELECT "${MIGRATIONS_TABLE.columns.name}" 
        FROM "${this.schema}"."${this.tableName}" 
        ORDER BY "${MIGRATIONS_TABLE.columns.name}"
      `);

      const executedMigrations = result.rows.map(
        (row) => row[MIGRATIONS_TABLE.columns.name]
      );

      // Get latest batch
      const batchResult = await this.db.$client.query(`
        SELECT MAX("${MIGRATIONS_TABLE.columns.batch}") as latest_batch 
        FROM "${this.schema}"."${this.tableName}"
      `);

      const latestBatch = batchResult.rows[0]?.latest_batch || 0;
      const newBatch = latestBatch + 1;

      // Filter migrations that haven't been executed yet
      const pendingMigrations = migrationFiles.filter(
        (migration) => !executedMigrations.includes(migration.name)
      );

      if (pendingMigrations.length === 0) {
        console.log(chalk.green("No pending migrations"));
        return;
      }

      // Check for multiple pending migrations
      if (pendingMigrations.length > 1 && !options?.allowMultiple) {
        console.log(chalk.yellow("⚠️  Multiple pending migrations detected"));
        console.log(chalk.yellow("This CMS recommends applying only one migration at a time."));
        console.log(chalk.blue("Pending migrations:"));
        pendingMigrations.forEach(m => {
          console.log(chalk.blue(`- ${m.name}`));
        });
        console.log(chalk.green("To run all migrations at once, use:"));
        console.log(chalk.green("   npx linkb migrate --allow-multiple"));
        console.log(chalk.yellow("If you want to continue, please run the command again with --allow-multiple flag."));
        return; // Exit without throwing an error
      }

      console.log(chalk.blue(`Running ${pendingMigrations.length} migrations`));

      // Run migrations that haven't been executed yet
      for (const migration of pendingMigrations) {
        console.log(chalk.blue(`Running migration: ${migration.name}`));

        // Execute migration
        try {
          // For dynamic import in Node.js we need to resolve the path
          const migrationPath = path.resolve(migration.path);
          const migrationModule = await import(migrationPath);

          // Begin transaction
          await this.db.$client.query("BEGIN");

          try {
            console.log(chalk.blue(`Executing 'up' function for migration: ${migration.name}`));
            
            // Check if the module has an up function
            if (typeof migrationModule.up === 'function') {
              // Pass db, client, and schema to the migration
              await migrationModule.up({
                db: this.db,                // Drizzle ORM instance
                client: this.db.$client,    // Raw PostgreSQL client
                schema: this.schema,        // Schema name
              });
            } else {
              // If no up function, try to find and execute migration.sql directly
              console.log(chalk.blue(`No 'up' function found. Looking for SQL file...`));
              
              if (migration.folder) {
                const sqlFilePath = path.join(migration.folder, 'migration.sql');
                
                if (fs.existsSync(sqlFilePath)) {
                  console.log(chalk.blue(`Executing SQL from ${sqlFilePath}`));
                  
                  // Read SQL file
                  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
                  
                  // Extract the up migration part (between -- Up Migration and -- Down Migration)
                  const upMatch = sqlContent.match(/-- Up Migration\s*BEGIN;\s*([\s\S]*?)COMMIT;/);
                  
                  if (upMatch && upMatch[1]) {
                    const upSql = upMatch[1].trim();
                    console.log(chalk.blue(`Executing UP SQL: ${upSql.substring(0, 100)}...`));
                    
                    // Execute the SQL
                    await this.db.$client.query(upSql);
                    console.log(chalk.green(`SQL executed successfully`));
                  } else {
                    throw new Error(`Could not find Up Migration in ${sqlFilePath}`);
                  }
                } else {
                  throw new Error(`No migration.sql file found in ${migration.folder}`);
                }
              } else {
                throw new Error(`No migration folder found for ${migration.name}`);
              }
            }

            // Record migration
            await this.db.$client.query(
              `
              INSERT INTO "${this.schema}"."${this.tableName}" ("${MIGRATIONS_TABLE.columns.name}", "${MIGRATIONS_TABLE.columns.batch}")
              VALUES ($1, $2)
            `,
              [migration.name, newBatch]
            );

            // Create a .applied file in the migration folder to indicate it's been applied
            if (migration.folder) {
              const appliedMarker = path.join(migration.folder, '.applied');
              fs.writeFileSync(appliedMarker, new Date().toISOString());
              console.log(chalk.green(`Created .applied marker in ${migration.folder}`));
            }

            // Commit transaction
            await this.db.$client.query("COMMIT");

            console.log(chalk.green(`Migration ${migration.name} completed`));
          } catch (error) {
            // Rollback transaction
            await this.db.$client.query("ROLLBACK");

            console.error(
              chalk.red(`Error running migration ${migration.name}: ${error}`)
            );
            
            if (error instanceof Error) {
              console.error(chalk.red("Details:", error.message));
              if (error.stack) {
                console.error(chalk.yellow("Stack trace:", error.stack));
              }
            }
            
            throw error;
          }
        } catch (importError) {
          console.error(
            chalk.red(
              `Error importing migration ${migration.name}: ${importError}`
            )
          );
          throw importError;
        }
      }

      console.log(chalk.green("All migrations completed successfully"));
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
      // Find migrations to rollback
      const result = await this.db.$client.query(`
        SELECT "${MIGRATIONS_TABLE.columns.name}", "${MIGRATIONS_TABLE.columns.batch}" 
        FROM "${this.schema}"."${this.tableName}"
        ORDER BY "${MIGRATIONS_TABLE.columns.id}" DESC
      `);

      if (result.rows.length === 0) {
        console.log(chalk.yellow("No migrations to rollback"));
        return;
      }

      // Get the latest batch
      const latestBatch = result.rows[0][MIGRATIONS_TABLE.columns.batch];

      // Get migrations from the latest batch, ordered by ID descending
      const migrationsToRollback = result.rows
        .filter(row => row[MIGRATIONS_TABLE.columns.batch] === latestBatch)
        .map(row => row[MIGRATIONS_TABLE.columns.name]);

      if (migrationsToRollback.length === 0) {
        console.log(chalk.yellow("No migrations to rollback in the latest batch"));
        return;
      }

      console.log(chalk.blue(`Rolling back ${migrationsToRollback.length} migrations from batch ${latestBatch}`));

      // Load all migration files
      const migrationFiles = await this.loadMigrationFiles();

      // For each migration to roll back, find the corresponding file
      for (const migrationName of migrationsToRollback) {
        const migrationFile = migrationFiles.find(file => file.name === migrationName);

        if (!migrationFile) {
          console.error(chalk.red(`Could not find migration file for ${migrationName}`));
          continue;
        }

        await this.rollbackMigration(migrationFile, latestBatch);
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
  public async status(
    options?: MigrationOptions
  ): Promise<{ name: string; status: "pending" | "applied" | "rolled-back"; batch?: number; executedAt?: Date }[]> {
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
        executedAt: row[MIGRATIONS_TABLE.columns.executedAt]
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
          const rolledBackMarker = path.join(file.folder, '.rolled-back');
          if (fs.existsSync(rolledBackMarker)) {
            status = "rolled-back";
          }
        }

        return {
          name: file.name,
          status,
          batch: executedMigration?.batch,
          executedAt: executedMigration?.executedAt
        };
      });

      // Sort by name
      statusList.sort((a, b) => a.name.localeCompare(b.name));

      // Print status table
      if (statusList.length > 0) {
        console.log(chalk.blue("Migration Status:"));
        console.log(
          chalk.blue("----------------------------------------------------------------------")
        );
        console.log(
          chalk.blue("Name                  | Status      | Batch | Executed At")
        );
        console.log(
          chalk.blue("----------------------------------------------------------------------")
        );

        statusList.forEach((migration) => {
          const name = migration.name.padEnd(22);
          const status = migration.status.padEnd(12);
          const batch = (migration.batch ? migration.batch.toString() : "-").padEnd(7);
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
          chalk.blue("----------------------------------------------------------------------")
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
   * Get the Drizzle schema definition for the migrations table
   * This will be useful for queries on the migrations table using Drizzle ORM
   */
  private getMigrationsTableSchema() {
    const { pgTable, serial, varchar, integer, timestamp } = pgCore;
    
    return pgTable(this.tableName, {
      id: serial(MIGRATIONS_TABLE.columns.id).primaryKey(),
      name: varchar(MIGRATIONS_TABLE.columns.name, { length: 255 }).notNull(),
      batch: integer(MIGRATIONS_TABLE.columns.batch).notNull(),
      executedAt: timestamp(MIGRATIONS_TABLE.columns.executedAt, { mode: 'date' }).defaultNow()
    }, (table) => ({
      schema: this.schema
    }));
  }

  /**
   * Execute a Drizzle query on the migrations table
   */
  private async queryMigrationsTable<T extends Record<string, any>>(
    queryBuilder: (schema: ReturnType<typeof this.getMigrationsTableSchema>) => any
  ): Promise<T[]> {
    try {
      const migrationsTable = this.getMigrationsTableSchema();
      const query = queryBuilder(migrationsTable);
      const result = await this.db.execute(query);
      // Transform the query result to the expected type
      return (result.rows || []) as T[];
    } catch (error) {
      console.error(chalk.red(`Error querying migrations table: ${error}`));
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
   * Create a new migration
   */
  public async createMigration(
    name: string,
    queries: { up: string[]; down: string[] } | string
  ): Promise<string> {
    const { folderPath, timestamp } = this.createMigrationFolder(name);
    const migrationName = `${timestamp}_${name.replace(/\s+/g, "_").toLowerCase()}`;
    const migrationFilePath = path.join(folderPath, "index.ts");
    
    // Generate migration content
    let migrationContent: string;
    
    if (typeof queries === "string") {
      // If queries is a string, it's raw Drizzle ORM code
      migrationContent = queries;
    } else {
      // Convert SQL queries to Drizzle migration
      const upQueriesStr = queries.up
        .map((query) => `  await client.query(\`${query}\`);`)
        .join("\n");
      const downQueriesStr = queries.down
        .map((query) => `  await client.query(\`${query}\`);`)
        .join("\n");
      
      migrationContent = `/**
 * Migration: ${migrationName}
 * Generated at: ${new Date().toISOString()}
 */

/**
 * Run the migration
 * @param {Object} context - Migration context
 * @param {Object} context.db - Drizzle ORM instance
 * @param {Object} context.client - Database client
 * @param {string} context.schema - Database schema
 */
export async function up({ db, client, schema }) {
${upQueriesStr}
}

/**
 * Rollback the migration
 * @param {Object} context - Migration context
 * @param {Object} context.db - Drizzle ORM instance
 * @param {Object} context.client - Database client
 * @param {string} context.schema - Database schema
 */
export async function down({ db, client, schema }) {
${downQueriesStr}
}
`;
    }
    
    // Write migration file
    fs.writeFileSync(migrationFilePath, migrationContent);
    console.log(chalk.green(`Created migration file: ${migrationFilePath}`));
    
    // Create README.md in the migration folder with a basic template
    const readmeContent = `# Migration: ${name}

Created at: ${new Date().toISOString()}

## Description

> Add a description of what this migration does here.

## Changes

> List the changes made by this migration.

`;
    
    fs.writeFileSync(path.join(folderPath, "README.md"), readmeContent);
    console.log(chalk.green(`Created README.md in ${folderPath}`));
    
    return migrationFilePath;
  }

  /**
   * Rollback migration
   */
  private async rollbackMigration(
    migrationFile: MigrationFile,
    batch: number
  ): Promise<void> {
    console.log(chalk.blue(`Rolling back migration: ${migrationFile.name}`));

    // For dynamic import in Node.js we need to resolve the path
    const migrationPath = path.resolve(migrationFile.path);
    const migrationModule = await import(migrationPath);

    // Begin transaction
    await this.db.$client.query("BEGIN");

    try {
      console.log(chalk.blue(`Executing 'down' function for ${migrationFile.name}`));
      
      // Check if the module has a down function
      if (typeof migrationModule.down === 'function') {
        // Pass db, client, and schema to the migration
        await migrationModule.down({
          db: this.db,                // Drizzle ORM instance
          client: this.db.$client,    // Raw PostgreSQL client
          schema: this.schema,        // Schema name
        });
      } else {
        // If no down function, try to find and execute migration.sql directly
        console.log(chalk.blue(`No 'down' function found. Looking for SQL file...`));
        
        if (migrationFile.folder) {
          const sqlFilePath = path.join(migrationFile.folder, 'migration.sql');
          
          if (fs.existsSync(sqlFilePath)) {
            console.log(chalk.blue(`Executing SQL from ${sqlFilePath}`));
            
            // Read SQL file
            const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
            
            // Extract the down migration part (after -- Down Migration)
            const downMatch = sqlContent.match(/-- Down Migration\s*BEGIN;\s*([\s\S]*?)COMMIT;/);
            
            if (downMatch && downMatch[1]) {
              const downSql = downMatch[1].trim();
              console.log(chalk.blue(`Executing DOWN SQL: ${downSql.substring(0, 100)}...`));
              
              // Execute the SQL
              await this.db.$client.query(downSql);
              console.log(chalk.green(`SQL executed successfully`));
            } else {
              throw new Error(`Could not find Down Migration in ${sqlFilePath}`);
            }
          } else {
            throw new Error(`No migration.sql file found in ${migrationFile.folder}`);
          }
        } else {
          throw new Error(`No migration folder found for ${migrationFile.name}`);
        }
      }

      // Remove migration record
      await this.db.$client.query(
        `
        DELETE FROM "${this.schema}"."${this.tableName}" 
        WHERE "${MIGRATIONS_TABLE.columns.name}" = $1 AND "${MIGRATIONS_TABLE.columns.batch}" = $2
      `,
        [migrationFile.name, batch]
      );

      // Remove the .applied file in the migration folder if it exists
      if (migrationFile.folder && fs.existsSync(migrationFile.folder)) {
        const appliedMarker = path.join(migrationFile.folder, '.applied');
        if (fs.existsSync(appliedMarker)) {
          fs.unlinkSync(appliedMarker);
          console.log(chalk.green(`Removed .applied marker from ${migrationFile.folder}`));
        }
        
        // Create a .rolled-back file to indicate this migration was rolled back
        const rolledBackMarker = path.join(migrationFile.folder, '.rolled-back');
        fs.writeFileSync(rolledBackMarker, new Date().toISOString());
        console.log(chalk.green(`Created .rolled-back marker in ${migrationFile.folder}`));
      }

      // Commit transaction
      await this.db.$client.query("COMMIT");

      console.log(chalk.green(`Rolled back migration ${migrationFile.name}`));
    } catch (error) {
      // Rollback transaction
      await this.db.$client.query("ROLLBACK");

      console.error(
        chalk.red(`Error rolling back migration ${migrationFile.name}: ${error}`)
      );
      
      if (error instanceof Error) {
        console.error(chalk.red("Details:", error.message));
        if (error.stack) {
          console.error(chalk.yellow("Stack trace:", error.stack));
        }
      }
      
      throw error;
    }
  }
}
