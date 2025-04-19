#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { execute } from './database';
import { loadEnv } from './utilities/loadEnv';
import path from 'node:path';
import fs from 'node:fs';
import { Api } from './api';
import { createApp } from './app';
import readline from 'node:readline';

const version: string = RSLIB_VERSION;
// Create a new Commander program
const program = new Command();

// Set up program metadata
program.name('linkb').description('linkb CMS core CLI').version(version);

// Add create-app command
program
  .command('create-app <app-name>')
  .description('Create a new linkb application')
  .option('-t, --template <n>', 'Template to use (default: basic)')
  .option('--use-npm', 'Use npm as the package manager')
  .option('--use-yarn', 'Use yarn as the package manager')
  .option('--use-pnpm', 'Use pnpm as the package manager')
  .action(async (appName, options) => {
    // Determine package manager
    let packageManager: 'npm' | 'yarn' | 'pnpm' | undefined;
    if (options.useNpm) packageManager = 'npm';
    else if (options.useYarn) packageManager = 'yarn';
    else if (options.usePnpm) packageManager = 'pnpm';

    await createApp(appName, {
      template: options.template,
      packageManager,
    });
  });

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
    console.log(chalk.blue('  - reset: Reset database by deleting all tables'));
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
    await databaseMiddleware('migrate');
    const api = new Api();
    await api.execute();
    process.exit(0);
  });

dbCommand
  .command('test-connection')
  .description('Test database connection')
  .action(async () => {
    await databaseMiddleware('test-connection');
    process.exit(0);
  });

dbCommand
  .command('reset')
  .description('Reset database by deleting all tables and data')
  .option('--delete-migrations', 'Delete migration files', false)
  .option('--delete-schema', 'Delete schema files', false)
  .action(async (options) => {
    console.log(
      chalk.red.bold(
        'WARNING: This command will delete ALL tables and data in your database.',
      ),
    );
    console.log(
      chalk.red(
        'This action is irreversible. Make sure you have a backup if needed.',
      ),
    );

    // Set environment variables based on options
    if (options.deleteMigrations) {
      process.env.DELETE_MIGRATIONS = 'true';
      console.log(chalk.yellow('Migration files will also be deleted.'));
    }

    if (options.deleteSchema) {
      process.env.DELETE_SCHEMA = 'true';
      console.log(chalk.yellow('Schema files will also be deleted.'));
    }

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      chalk.bold('Are you sure you want to continue? (yes/no): '),
      async (answer: string) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          rl.close();
          console.log(chalk.blue('Proceeding with database reset...'));

          try {
            await databaseMiddleware('reset');
            console.log(chalk.green('Database reset completed successfully.'));
            process.exit(0);
          } catch (error) {
            console.error(chalk.red('Database reset failed:'), error);
            process.exit(1);
          }
        } else {
          console.log(chalk.blue('Database reset cancelled.'));
          rl.close();
          process.exit(0);
        }
      },
    );
  });

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help();
}
