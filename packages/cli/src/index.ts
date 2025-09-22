#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import chalk from 'chalk';
import { Command } from 'commander';
import { Api } from './api';
import { createApp } from './app';
import { execute } from './database';
import { loadEnv } from './utilities/loadEnv';

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
    if (options.useNpm) {
      packageManager = 'npm';
    } else if (options.useYarn) {
      packageManager = 'yarn';
    } else if (options.usePnpm) {
      packageManager = 'pnpm';
    }

    await createApp(appName, {
      template: options.template,
      packageManager,
    });
  });

// Middleware function for database commands
const databaseMiddleware = async (actionName: string) => {
  // Check if .env exists
  if (!loadEnv('./')) {
    process.exit(1);
  }

  // Check if DATABASE_TYPE is set
  if (!process.env.DATABASE_TYPE) {
    process.exit(1);
  }

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    process.exit(1);
  }

  // Check if cms.config.tsx exists
  if (!fs.existsSync(path.join(process.cwd(), 'cms.config.tsx'))) {
    process.exit(1);
  }

  try {
    await execute(actionName);
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
    // Set environment variables based on options
    if (options.deleteMigrations) {
      process.env.DELETE_MIGRATIONS = 'true';
    }

    if (options.deleteSchema) {
      process.env.DELETE_SCHEMA = 'true';
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

          try {
            await databaseMiddleware('reset');
            process.exit(0);
          } catch (error) {
            console.error(chalk.red('Database reset failed:'), error);
            process.exit(1);
          }
        } else {
          rl.close();
          process.exit(0);
        }
      }
    );
  });

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help();
}
