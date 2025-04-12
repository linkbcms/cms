#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { execute } from './database';
import { loadEnv } from './utilities/loadEnv';
import path from 'node:path';
import fs from 'node:fs';
import { Api } from './api';

const version: string = RSLIB_VERSION;
// Create a new Commander program
const program = new Command();

// Set up program metadata
program.name('linkb').description('linkb CMS core CLI').version(version);

// Middleware function for database commands
const databaseMiddleware = async (actionName: string) => {
  console.log(chalk.blue(`Current working directory: ${process.cwd()}`));

  // Check if .env exists
  if (!loadEnv('./')) {
    console.log(chalk.red('.env file not found'));
    console.log(
      chalk.yellow(
        'Create a .env file with DATABASE_TYPE and connection details',
      ),
    );
    process.exit(1);
  }

  // Check if DATABASE_TYPE is set
  if (!process.env.DATABASE_TYPE) {
    console.log(chalk.red('DATABASE_TYPE not defined in .env file'));
    console.log(chalk.yellow('Please add DATABASE_TYPE to your .env file'));
    process.exit(1);
  }

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log(chalk.red('DATABASE_URL not defined in .env file'));
    console.log(chalk.yellow('Please add DATABASE_URL to your .env file'));
    process.exit(1);
  }

  // Check if cms.config.tsx exists
  if (!fs.existsSync(path.join(process.cwd(), 'cms.config.tsx'))) {
    console.log(chalk.red('cms.config.tsx not found in current directory'));
    console.log(
      chalk.yellow(
        'Please navigate to your linkb project folder (not the root folder)',
      ),
    );
    process.exit(1);
  }

  console.log(chalk.blue(`Executing database action: ${actionName}`));

  try {
    await execute(actionName);
    console.log(chalk.green(`Successfully completed: ${actionName}`));
  } catch (error) {
    console.error(chalk.red(`${actionName} failed:`), error);
    process.exit(1);
  }
};

// Add db command with subcommands
const dbCommand = program
  .command('db')
  .description('Database operations')
  .action(() => {
    // This action will execute when 'linkb db' is run without subcommands
    console.log(chalk.yellow('Please specify a database operation:'));
    console.log(
      chalk.blue('  - gen-schema: Generate database migration from cms config'),
    );
    console.log(chalk.blue('  - migrate: Run database migrations'));
    console.log(chalk.blue('  - status: Check migration status'));
    console.log(chalk.blue('  - test-connection: Test database connectivity'));
    console.log();
    console.log(chalk.yellow('Example: linkb db migrate'));
    process.exit(1);
  });

dbCommand
  .command('gen-schema')
  .description('Generate database migration from cms config')
  .action(async () => {
    await databaseMiddleware('gen-schema');
    process.exit(0);
  });

dbCommand
  .command('migrate')
  .description('Run database migrations')
  .action(async () => {
    // await databaseMiddleware('migrate');
    const api = new Api();
    await api.execute();
    process.exit(0);
  });

dbCommand
  .command('status')
  .description('Check migration status')
  .action(async () => {
    await databaseMiddleware('status');
    process.exit(0);
  });

dbCommand
  .command('test-connection')
  .description('Test database connection')
  .action(async () => {
    await databaseMiddleware('test-connection');
    process.exit(0);
  });

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help();
}
