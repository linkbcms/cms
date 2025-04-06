import fs from "fs";
import path from "path";
import chalk from "chalk";
import { DatabaseAdapter, MigrationOptions } from "./types";
import { defineConfig } from "../../../type";

/**
 * Migration file information
 */
export interface MigrationFile {
  name: string; // Migration name (with timestamp prefix)
  path: string; // Full path to the migration file
  folder?: string; // Folder containing the migration (if using folder structure)
}

/**
 * Base adapter implementation with common functionality
 */
export abstract class BaseAdapter implements DatabaseAdapter {
  protected schemaDir: string;
  protected migrationDir: string;
  protected tableName: string;
  protected config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
    this.schemaDir = config.schemaDir || "schema";
    this.migrationDir = config.migrationDir || "migration";
    this.tableName = config.tableName || "migrations";
  }

  /**
   * Initialize the adapter
   */
  public abstract initialize(): Promise<void>;

  /**
   * Test database connection
   * @returns Promise that resolves to true if connection is successful, false otherwise
   */
  public abstract testConnection(): Promise<boolean>;

  /**
   * Generate schema
   */
  public abstract generateSchema(
    config: ReturnType<typeof defineConfig>
  ): Promise<void>;

  /**
   * Run migrations
   */
  public abstract migrate(options?: MigrationOptions): Promise<void>;

  /**
   * Get migration status
   */
  public abstract status(options?: MigrationOptions): Promise<
    {
      name: string;
      status: "pending" | "applied" | "rolled-back";
      batch?: number;
      executedAt?: Date;
    }[]
  >;

  /**
   * Close database connection
   */
  public abstract close(): Promise<void>;

  /**
   * Create a new migration folder with the given name
   * @returns The path to the new migration folder and the timestamp
   */
  protected createMigrationFolder(name: string): {
    folderPath: string;
    timestamp: string;
  } {
    // Generate a timestamp in YYYYMMDDHHmmss format
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .substring(0, 14);

    // Use timestamp as the folder name
    const folderName = `${timestamp}`;
    const folderPath = path.join(this.schemaDir, folderName);

    // Create the folder
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    return { folderPath, timestamp };
  }

  /**
   * Load migration files from the migration directory
   * Supports both flat structure and folder-based structure
   */
  protected async loadMigrationFiles(): Promise<MigrationFile[]> {
    const migrationFiles: MigrationFile[] = [];
    try {
      // Create migration directory if it doesn't exist
      if (!fs.existsSync(this.schemaDir)) {
        fs.mkdirSync(this.schemaDir, { recursive: true });
        console.log(
          chalk.yellow(`Created migrations directory: ${this.schemaDir}`)
        );
        return [];
      }

      const entries = fs.readdirSync(this.schemaDir, { withFileTypes: true });

      // First, handle top-level files (legacy flat structure)
      const topLevelFiles = entries.filter((entry) => entry.isFile());
      for (const entry of topLevelFiles) {
        const file = entry.name;

        // Handle TypeScript/JavaScript files
        if (file.endsWith(".js") || file.endsWith(".ts")) {
          // Extract the name without extension
          const fullName = file.replace(/\.(js|ts)$/, "");

          migrationFiles.push({
            name: fullName,
            path: path.join(this.schemaDir, file),
          });
        }
      }

      // Then, handle folders (new structure)
      const folders = entries.filter((entry) => entry.isDirectory());
      for (const folder of folders) {
        const folderName = folder.name;
        const folderPath = path.join(this.schemaDir, folderName);

        // Check if the folder name matches the timestamp pattern (14 digits)
        if (!/^\d{14}$/.test(folderName)) continue;

        // Look for migration files within the folder
        const folderFiles = fs.readdirSync(folderPath);

        // Try to find index.ts or index.js first
        const migrationFile =
          folderFiles.find((f) => f === "index.ts" || f === "index.js") ||
          folderFiles.find(
            (f) => f === "migration.sql" || f === "sql.ts" || f === "sql.js"
          ) ||
          folderFiles.find((f) => f.endsWith(".ts") || f.endsWith(".js"));

        if (migrationFile) {
          migrationFiles.push({
            name: folderName,
            path: path.join(folderPath, migrationFile),
            folder: folderPath,
          });
        }
      }

      // Sort migrations by name (which includes timestamp)
      return migrationFiles.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error(chalk.red(`Error loading migration files: ${error}`));
      return [];
    }
  }
}
