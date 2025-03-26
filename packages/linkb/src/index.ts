#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import packageJson from "../package.json";
import { execute } from "./database";
import { findWorkspaceRoot } from "./utilities/findWorkSpaceRoot";

// Create a new Commander program
const program = new Command();

// Set up program metadata
program
  .name("linkb")
  .description("linkb CMS core CLI")
  .version(packageJson.version);

// // Define commands
// program
//   .command('hello')
//   .description('Say hello')
//   .argument('[name]', 'Name to greet', 'World')
//   .option('-c, --color <color>', 'text color', 'green')
//   .action((name, options) => {
//     const colorFn = (chalk as any)[options.color] || chalk.green;
//     console.log(colorFn(`Hello, ${name}!`));
//   });

// // Add more commands here
// program
//   .command('list')
//   .description('List items')
//   .action(() => {
//     console.log(chalk.blue('Here is a list of items:'));
//     console.log(chalk.yellow('- Item 1'));
//     console.log(chalk.yellow('- Item 2'));
//     console.log(chalk.yellow('- Item 3'));
//   });

// Add db command with subcommands
const dbCommand = program.command("db").description("Database operations");

dbCommand
  .command("gen-schema")
  .description("Generate database migration from cms config")
  .action(async () => {
    try {
      await execute("gen-schema");
      process.exit(1);
    } catch (error) {
      console.error(chalk.red("Migration failed:"), error);
      process.exit(1);
    }
  });

dbCommand
  .command("migrate")
  .description("Run database migrations")
  .action(async () => {
    try {
      await execute("migrate");
    } catch (error) {
      console.error(chalk.red("Migration failed:"), error);
      process.exit(1);
    }
  });

dbCommand
  .command("rollback")
  .description("Rollback database migrations")
  .action(async () => {
    try {
      await execute("rollback");
    } catch (error) {
      console.error(chalk.red("Rollback failed:"), error);
      process.exit(1);
    }
  });

dbCommand
  .command("status")
  .description("Check migration status")
  .action(async () => {
    try {
      await execute("status");
    } catch (error) {
      console.error(chalk.red("Status check failed:"), error);
      process.exit(1);
    }
  });

dbCommand
  .command("make <name>")
  .description("Create a new migration file")
  .action(async (name) => {
    try {
      await execute("make", [name]);
    } catch (error) {
      console.error(chalk.red("Migration creation failed:"), error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help();
}
