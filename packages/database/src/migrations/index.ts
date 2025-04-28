import chalk from 'chalk';
import path from 'node:path';
import type { defineConfig } from '@linkbcms/core';
import {
  AdapterFactory,
  SUPPORTED_DATABASES,
  type SupportedDatabase,
} from '../adapters';

/**
 * Execute a database action
 * @param action The action to execute
 * @param options Configuration options
 */
export const execute = async (
  action: string,
  options: {
    workspaceRoot?: string;
    databaseType?: string;
    connectionString?: string;
    schema?: string;
    schemaDir?: string;
    migrationDir?: string;
    configPath?: string;
    loadConfigFn?: (path: string) => Promise<any>;
  },
): Promise<void> => {
  // Skipped action validation as it will be handled by function name later

  const workspaceRoot = options.workspaceRoot || process.cwd();
  const databaseType = options.databaseType || process.env.DATABASE_TYPE || '';
  const connectionString =
    options.connectionString || process.env.DATABASE_URL || '';

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

    // Get database configuration
    const dbConfig = {
      connectionString: connectionString,
      schema: options.schema || process.env.DATABASE_SCHEMA,
      schemaDir: options.schemaDir || `${workspaceRoot}/database/schema`,
      migrationDir: options.migrationDir || './database/migration',
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

    // Load CMS config if needed
    let cmsConfig: ReturnType<typeof defineConfig> | undefined;

    if (action === 'gen-schema') {
      const filePath = options.configPath || path.resolve('cms.config.tsx');

      if (options.loadConfigFn) {
        cmsConfig = await options.loadConfigFn(filePath);
      } else {
        // Default fallback if no load function is provided
        try {
          cmsConfig = require(filePath);
        } catch (error) {
          throw new Error(`Failed to load config from ${filePath}`);
        }
      }
    }

    if (action !== 'gen-schema') {
      try {
        await adapter.initialize();
      } catch (error) {
        throw new Error('✗ Failed to connect to the database');
      }
    }

    switch (action) {
      case 'gen-schema':
        if (!cmsConfig) {
          throw new Error('CMS config is required for schema generation');
        }
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
    throw error; // Rethrow to let the caller handle it
  }
};

export async function genSchemaAction(options: {
  workspaceRoot?: string;
  databaseType?: string;
  connectionString?: string;
  schema?: string;
  schemaDir?: string;
  migrationDir?: string;
  configPath?: string;
  loadConfigFn?: (path: string) => Promise<any>;
}) {
  const workspaceRoot = options.workspaceRoot || process.cwd();
  const databaseType = options.databaseType || process.env.DATABASE_TYPE || '';
  const connectionString =
    options.connectionString || process.env.DATABASE_URL || '';

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
    const dbConfig = {
      connectionString: connectionString,
      schema: options.schema || process.env.DATABASE_SCHEMA,
      schemaDir: options.schemaDir || `${workspaceRoot}/database/schema`,
      migrationDir: options.migrationDir || './database/migration',
    };
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
    const dbType = databaseType.toLowerCase() as SupportedDatabase;
    const adapterFactory = new AdapterFactory();
    const adapter = adapterFactory.createAdapter(dbType, dbConfig);
    let cmsConfig: ReturnType<typeof defineConfig> | undefined;
    const filePath = options.configPath || path.resolve('cms.config.tsx');
    if (options.loadConfigFn) {
      cmsConfig = await options.loadConfigFn(filePath);
    } else {
      try {
        cmsConfig = require(filePath);
      } catch (error) {
        throw new Error(`Failed to load config from ${filePath}`);
      }
    }
    if (!cmsConfig) {
      throw new Error('CMS config is required for schema generation');
    }
    await adapter.generateSchema(cmsConfig);
    await adapter.close();
  } catch (error) {
    console.error(chalk.red(`Error: ${error}`));
    if (error instanceof Error && error.stack) {
      console.error(chalk.red(error.stack));
    }
    throw error;
  }
}

export async function migrateAction(options: {
  workspaceRoot?: string;
  databaseType?: string;
  connectionString?: string;
  schema?: string;
  schemaDir?: string;
  migrationDir?: string;
}) {
  const workspaceRoot = options.workspaceRoot || process.cwd();
  const databaseType = options.databaseType || process.env.DATABASE_TYPE || '';
  const connectionString =
    options.connectionString || process.env.DATABASE_URL || '';

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
    const dbConfig = {
      connectionString: connectionString,
      schema: options.schema || process.env.DATABASE_SCHEMA,
      schemaDir: options.schemaDir || `${workspaceRoot}/database/schema`,
      migrationDir: options.migrationDir || './database/migration',
    };
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
    const dbType = databaseType.toLowerCase() as SupportedDatabase;
    const adapterFactory = new AdapterFactory();
    const adapter = adapterFactory.createAdapter(dbType, dbConfig);
    await adapter.initialize();
    console.log(chalk.blue('Database configuration:'));
    console.log(
      chalk.blue(`  - Migration directory: ${dbConfig.migrationDir}`),
    );
    if (dbConfig.schema)
      console.log(chalk.blue(`  - Schema: ${dbConfig.schema}`));
    await adapter.migrate();
    await adapter.close();
  } catch (error) {
    console.error(chalk.red(`Error: ${error}`));
    if (error instanceof Error && error.stack) {
      console.error(chalk.red(error.stack));
    }
    throw error;
  }
}

export async function testConnectionAction(options: {
  workspaceRoot?: string;
  databaseType?: string;
  connectionString?: string;
  schema?: string;
  schemaDir?: string;
  migrationDir?: string;
}) {
  const workspaceRoot = options.workspaceRoot || process.cwd();
  const databaseType = options.databaseType || process.env.DATABASE_TYPE || '';
  const connectionString =
    options.connectionString || process.env.DATABASE_URL || '';

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
    const dbConfig = {
      connectionString: connectionString,
      schema: options.schema || process.env.DATABASE_SCHEMA,
      schemaDir: options.schemaDir || `${workspaceRoot}/database/schema`,
      migrationDir: options.migrationDir || './database/migration',
    };
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
    const dbType = databaseType.toLowerCase() as SupportedDatabase;
    const adapterFactory = new AdapterFactory();
    const adapter = adapterFactory.createAdapter(dbType, dbConfig);
    await adapter.initialize();
    try {
      await adapter.testConnection();
      console.log(chalk.blue('Testing database connection...'));
      console.log(chalk.green('✓ Successfully connected to the database'));
      await adapter.close();
    } catch (error) {
      console.error(chalk.red('✗ Failed to connect to the database'));
      await adapter.close();
      throw error;
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error}`));
    if (error instanceof Error && error.stack) {
      console.error(chalk.red(error.stack));
    }
    throw error;
  }
}

export async function resetAction(options: {
  workspaceRoot?: string;
  databaseType?: string;
  connectionString?: string;
  schema?: string;
  schemaDir?: string;
  migrationDir?: string;
}) {
  const workspaceRoot = options.workspaceRoot || process.cwd();
  const databaseType = options.databaseType || process.env.DATABASE_TYPE || '';
  const connectionString =
    options.connectionString || process.env.DATABASE_URL || '';

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
    const dbConfig = {
      connectionString: connectionString,
      schema: options.schema || process.env.DATABASE_SCHEMA,
      schemaDir: options.schemaDir || `${workspaceRoot}/database/schema`,
      migrationDir: options.migrationDir || './database/migration',
    };
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
    const dbType = databaseType.toLowerCase() as SupportedDatabase;
    const adapterFactory = new AdapterFactory();
    const adapter = adapterFactory.createAdapter(dbType, dbConfig);
    await adapter.initialize();
    await adapter.resetDatabase({
      deleteMigrations: process.env.DELETE_MIGRATIONS === 'true',
      deleteSchema: process.env.DELETE_SCHEMA === 'true',
    });
    await adapter.close();
  } catch (error) {
    console.error(chalk.red(`Error: ${error}`));
    if (error instanceof Error && error.stack) {
      console.error(chalk.red(error.stack));
    }
    throw error;
  }
}
