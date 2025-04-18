import chalk from 'chalk';
import { findWorkspaceRoot } from '../utilities/findWorkSpaceRoot';
import { AdapterFactory } from './adapters';
import { SUPPORTED_DATABASES, type SupportedDatabase } from './adapters/types';
import path from 'node:path';
import type { defineConfig } from '@linkbcms/core';
import { loadModule } from '../utilities/loadModule';

// Define valid actions for better validation
const VALID_ACTIONS = [
  'gen-schema',
  'migrate',
  'status',
  'test-connection',
  'reset',
];

export const execute = async (action: string): Promise<void> => {
  // Validate action
  if (!action || !VALID_ACTIONS.includes(action)) {
    console.log(chalk.red(`Invalid or missing action: ${action || 'none'}`));
    console.log(chalk.yellow('Supported actions:'));
    console.log(chalk.blue('  - gen-schema: Generate database schema'));
    console.log(chalk.blue('  - migrate: Run pending migrations'));
    console.log(chalk.blue('  - test-connection: Test database connectivity'));
    return;
  }

  const workspaceRoot = findWorkspaceRoot();
  const databaseType = process.env.DATABASE_TYPE || '';
  const connectionString = process.env.DATABASE_URL || '';

  // Validate database type
  if (
    !SUPPORTED_DATABASES.includes(
      databaseType.toLowerCase() as SupportedDatabase,
    )
  ) {
    console.log(chalk.red(`Unsupported database type: ${databaseType}`));
    console.log(chalk.yellow('Supported database types:'));
    for (const db of SUPPORTED_DATABASES) {
      console.log(chalk.blue(`  - ${db}`));
    }
    return;
  }

  try {
    console.log(chalk.blue(`Using database type: ${databaseType}`));

    // Get database configuration from environment variables
    const dbConfig = {
      connectionString: connectionString,
      schema: process.env.DATABASE_SCHEMA,
      schemaDir: `${workspaceRoot}/database/schema`,
      migrationDir: './database/migration',
    };

    // Check for common connection string format issues without exposing credentials
    const connectionStringLower = dbConfig.connectionString.toLowerCase();
    if (
      !connectionStringLower.startsWith('postgresql://') &&
      !connectionStringLower.startsWith('postgres://')
    ) {
      console.log(
        chalk.yellow(
          "Warning: Your DATABASE_URL doesn't start with 'postgresql://' or 'postgres://'",
        ),
      );
      console.log(
        chalk.yellow(
          'This might cause connection issues. Check your connection string format.',
        ),
      );
    }

    // Create and initialize adapter
    const dbType = databaseType.toLowerCase() as SupportedDatabase;
    const adapterFactory = new AdapterFactory();
    const adapter = adapterFactory.createAdapter(dbType, dbConfig);

    const filePath = path.resolve('cms.config.tsx');
    const cmsConfig = (await loadModule(filePath)) as ReturnType<
      typeof defineConfig
    >;

    if (action !== 'gen-schema') {
      try {
        await adapter.initialize();
      } catch (error) {
        throw new Error('✗ Failed to connect to the database');
      }
    }
    switch (action) {
      case 'gen-schema':
        await adapter.generateSchema(cmsConfig);
        await adapter.close();
        break;
      case 'migrate':
        console.log(chalk.blue('Database configuration:'));
        console.log(
          chalk.blue(`  - Migration directory: ${dbConfig.migrationDir}`),
        );
        if (dbConfig.schema)
          console.log(chalk.blue(`  - Schema: ${dbConfig.schema}`));
        await adapter.migrate();
        await adapter.close();
        break;
      case 'test-connection':
        try {
          await adapter.testConnection();
          console.log(chalk.blue('Testing database connection...'));
          console.log(chalk.green('✓ Successfully connected to the database'));
          await adapter.close();
        } catch (error) {
          console.error(chalk.red('✗ Failed to connect to the database'));
          throw error;
        }
        break;
      case 'reset':
        await adapter.resetDatabase({
          deleteMigrations: process.env.DELETE_MIGRATIONS === 'true',
          deleteSchema: process.env.DELETE_SCHEMA === 'true',
        });
        await adapter.close();

        break;
      default:
        // This should never be reached due to our validation above
        console.log(chalk.red(`Unknown action: ${action}`));
        console.log(chalk.yellow('Supported actions:'));
        console.log(chalk.blue('  - gen-schema: Generate database schema'));
        console.log(chalk.blue('  - migrate: Run pending migrations'));
        console.log(chalk.blue('  - status: Show migration status'));
        console.log(
          chalk.blue('  - test-connection: Test database connectivity'),
        );
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error}`));
    if (error instanceof Error && error.stack) {
      console.error(chalk.red(error.stack));
    }
    throw error; // Rethrow to let the middleware handle it
  }
};
