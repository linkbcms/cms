import chalk from 'chalk';
import { findWorkspaceRoot } from '../utilities/findWorkSpaceRoot';
import path from 'node:path';
import { execute as dbExecute } from '@linkbcms/database';
import { loadModule } from '../utilities/loadModule';

/**
 * Executes a database action through the @linkbcms/database package
 */
export const execute = async (action: string): Promise<void> => {
  const workspaceRoot = findWorkspaceRoot();
  const databaseType = process.env.DATABASE_TYPE || '';
  const connectionString = process.env.DATABASE_URL || '';
  try {
    // Execute the database action using the database package
    await dbExecute(action, {
      workspaceRoot,
      databaseType,
      connectionString,
      schema: process.env.DATABASE_SCHEMA,
      schemaDir: `${workspaceRoot}/database/schema`,
      migrationDir: './database/migration',
      configPath: path.resolve('cms.config.tsx'),
      loadConfigFn: loadModule,
    });
  } catch (error) {
    console.error(chalk.red(`Error: ${error}`));
    if (error instanceof Error && error.stack) {
      console.error(chalk.red(error.stack));
    }
    throw error; // Rethrow to let the middleware handle it
  }
};
