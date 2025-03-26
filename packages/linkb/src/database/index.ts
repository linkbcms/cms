import chalk from "chalk";
import { findWorkspaceRoot } from "../utilities/findWorkSpaceRoot";
import { loadEnv } from "../utilities/loadEnv";
import { AdapterFactory } from "./adapters";
import { SUPPORTED_DATABASES, SupportedDatabase } from "./adapters/types";
import GenerateSchema from "./schema/generateSchema";
import config from "./config";

export const execute = async (
  action: string,
  args?: string[]
): Promise<void> => {
  const workspaceRoot = findWorkspaceRoot();

  if (!loadEnv(workspaceRoot)) {
    console.log(chalk.red(".env file not found"));
    console.log(
      chalk.yellow(
        "Create a .env file with DATABASE_TYPE and connection details"
      )
    );
    return;
  }

  const databaseType = process.env.DATABASE_TYPE;

  if (!databaseType) {
    console.log(chalk.red("DATABASE_TYPE not defined in .env file"));
    console.log(
      chalk.yellow("Add DATABASE_TYPE to your .env file. Supported values:")
    );
    SUPPORTED_DATABASES.forEach((db) => {
      console.log(chalk.blue(`  - ${db}`));
    });
    return;
  }

  if (
    !SUPPORTED_DATABASES.includes(
      databaseType.toLowerCase() as SupportedDatabase
    )
  ) {
    console.log(chalk.red(`Unsupported database type: ${databaseType}`));
    console.log(chalk.yellow("Supported database types:"));
    SUPPORTED_DATABASES.forEach((db) => {
      console.log(chalk.blue(`  - ${db}`));
    });
    return;
  }

  try {
    console.log(chalk.blue(`Using database type: ${databaseType}`));

    // Get database configuration from environment variables
    const dbConfig = {
      connectionString: process.env.DATABASE_URL,
      schema: process.env.DATABASE_SCHEMA,
      migrationDir:
        process.env.MIGRATION_DIR ||
        `${workspaceRoot}/apps/web/database/migrations`,
      tableName: process.env.MIGRATION_TABLE || "migrations",
      ssl: process.env.DATABASE_SSL === "true",
    };

    // Validate connection string
    if (!dbConfig.connectionString) {
      console.log(chalk.red("DATABASE_URL not defined in .env file"));
      console.log(
        chalk.yellow(
          "Please add DATABASE_URL to your .env file with a valid connection string"
        )
      );
      console.log(
        chalk.yellow(
          "Example: postgresql://username:password@localhost:5432/database"
        )
      );
      return;
    }

    // Check for common connection string format issues without exposing credentials
    const connectionStringLower = dbConfig.connectionString.toLowerCase();
    if (
      !connectionStringLower.startsWith("postgresql://") &&
      !connectionStringLower.startsWith("postgres://")
    ) {
      console.log(
        chalk.yellow(
          "Warning: Your DATABASE_URL doesn't start with 'postgresql://' or 'postgres://'"
        )
      );
      console.log(
        chalk.yellow(
          "This might cause connection issues. Check your connection string format."
        )
      );
    }

    // Log configuration (without sensitive data)
    console.log(chalk.blue("Database configuration:"));
    console.log(
      chalk.blue(`  - Migration directory: ${dbConfig.migrationDir}`)
    );
    console.log(chalk.blue(`  - Table: ${dbConfig.tableName}`));
    if (dbConfig.schema)
      console.log(chalk.blue(`  - Schema: ${dbConfig.schema}`));
    if (dbConfig.ssl) console.log(chalk.blue(`  - SSL: enabled`));

    // Create and initialize adapter
    const dbType = databaseType.toLowerCase() as SupportedDatabase;
    const adapter = AdapterFactory.createAdapter(dbType, dbConfig);
    // Execute requested action
    await adapter.initialize();
    switch (action) {
      case "gen-schema":
        // await GenerateSchema(`${workspaceRoot}/apps/web/database`, config);
        await adapter.generateSchema(config)
        break;
      case "migrate":
        await adapter.migrate();
        await adapter.close();
        break;
      case "rollback":
        await adapter.rollback();
        await adapter.close();
        break;
      case "status":
        const status = await adapter.status();
        console.log(chalk.blue("Migration Status:"));
        status.forEach((migration) => {
          const statusColor =
            migration.status === "applied" ? chalk.green : chalk.yellow;
          console.log(
            `${statusColor(migration.status)} - ${migration.name}${
              migration.batch ? ` (batch ${migration.batch})` : ""
            }`
          );
        });
        await adapter.close();
        break;
      case "test-connection":
        try {
          console.log(chalk.blue("Testing database connection..."));
          await adapter.initialize();
          console.log(chalk.green("✓ Successfully connected to the database"));
          await adapter.close();
        } catch (error) {
          console.error(chalk.red("✗ Failed to connect to the database"));
          throw error;
        }
        break;
      case "make":
        if (!args || args.length === 0) {
          console.log(chalk.red("Migration name is required"));
          return;
        }
        const migrationName = args[0];
        const migrationPath = await adapter.createMigration(migrationName, {
          dir: dbConfig.migrationDir,
        });
        console.log(chalk.green(`Migration file created: ${migrationPath}`));
        break;
      default:
        console.log(chalk.red(`Unknown action: ${action}`));
        console.log(chalk.yellow("Supported actions:"));
        console.log(chalk.blue("  - migrate: Run pending migrations"));
        console.log(
          chalk.blue("  - rollback: Rollback the last batch of migrations")
        );
        console.log(chalk.blue("  - status: Show migration status"));
        console.log(
          chalk.blue("  - test-connection: Test database connectivity")
        );
        console.log(chalk.blue("  - make: Create a new migration file"));
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error}`));
    if (error instanceof Error && error.stack) {
      console.error(chalk.red(error.stack));
    }
  }
};
