import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import type { DatabaseAdapter } from './adapters';
import type { defineConfig } from '@linkbcms/core';

// Basic schema definition types
export interface ColumnDefinition {
  type: string;
  nullable: boolean;
  default?: string;
  maxLength?: number | null;
}

export interface TableDefinition {
  [columnName: string]: ColumnDefinition;
}

export interface SchemaDefinition {
  [tableName: string]: TableDefinition;
}

// Schema generator options
export interface SchemaGeneratorOptions {
  type?: 'postgres' | 'mysql' | 'sqlite';
  schemaDir: string;
  config: ReturnType<typeof defineConfig>;
  schema?: string;
}

/**
 * Base class for schema generators
 * This provides the common interface and shared functionality for all schema generators
 */
export abstract class BaseSchemaGenerator {
  protected schemaDir: string;
  protected config: ReturnType<typeof defineConfig>;
  protected adapter: DatabaseAdapter;

  constructor(adapter: DatabaseAdapter, options: SchemaGeneratorOptions) {
    this.adapter = adapter;
    this.schemaDir = options.schemaDir;
    this.config = options.config;

    // Ensure schema directory exists
    if (!fs.existsSync(this.schemaDir)) {
      fs.mkdirSync(this.schemaDir, { recursive: true });
    }
  }

  /**
   * Main entry point for schema generation
   * This method coordinates the entire schema generation process
   */
  public async generateSchema(): Promise<void> {
    if (!this.config?.collections) {
      console.log('No collections found in config');
      return;
    }

    try {
      console.log(
        chalk.blue('Generating schema from collections configuration...'),
      );

      // Generate new schema based on config
      const newSchema = await this.generateNewSchema(this.config);
      // Output schema information
      console.log(chalk.green('Schema generation completed'));
      console.log(chalk.blue('Generated schema structure:'));

      // Save schema to file if needed
      await this.saveSchemaToFile(newSchema);

      console.log(chalk.green('Schema generation completed successfully'));
    } catch (error) {
      console.error('Error generating schema:', error);
      throw error;
    }
  }

  /**
   * Generate new schema based on collections config
   */
  protected abstract generateNewSchema(
    config: ReturnType<typeof defineConfig>,
  ): Promise<SchemaDefinition>;

  /**
   * Save the generated schema to a file
   * This is optional and can be implemented by concrete classes
   */
  protected async saveSchemaToFile(schema: SchemaDefinition): Promise<void> {
    try {
      // Define the output file path
      const schemaFilePath = path.join(this.schemaDir, 'schema.ts');

      // Start with imports
      let schemaFileContent = `// Generated schema file
import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

`;

      // Generate any enums if needed (would need to extend our schema definition to support this)

      // Generate table declarations
      for (const [tableName, tableSchema] of Object.entries(schema)) {
        // Check if table has any references (for index generation)
        const hasReferences = Object.values(tableSchema).some(
          (col) =>
            col.type.toLowerCase().includes('references') ||
            (col as any).references !== undefined,
        );

        schemaFileContent += `export const ${this.camelCase(tableName)} = table(\n`;
        schemaFileContent += `  "${tableName}",\n`;
        schemaFileContent += '  {\n';

        // Generate column declarations
        for (const [columnName, columnDef] of Object.entries(tableSchema)) {
          const columnType = this.getDrizzleColumnType(columnDef, columnName);

          schemaFileContent += `    ${this.camelCase(columnName)}: ${columnType},\n`;
        }

        schemaFileContent += '  }';

        // Add indexes if we have information (would need schema extensions)
        if (hasReferences) {
          schemaFileContent +=
            ',\n  (table) => [\n    // Add indexes here if needed\n  ]\n';
        }

        schemaFileContent += '\n);\n\n';
      }

      // Write the file
      fs.writeFileSync(schemaFilePath, schemaFileContent);
      console.log(chalk.green(`Schema saved to ${schemaFilePath}`));
    } catch (error) {
      console.error(chalk.red(`Error saving schema to file: ${error}`));
    }
  }

  /**
   * Convert a string to camelCase
   */
  private camelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase(),
      )
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '');
  }

  /**
   * Get the Drizzle column type from our ColumnDefinition
   */
  private getDrizzleColumnType(
    columnDef: ColumnDefinition,
    columnName: string,
  ): string {
    const type = columnDef.type.toLowerCase();
    const isSnakeCase = columnName.includes('_');
    let columnDeclaration = '';

    // For ID columns, always use bigserial (represented as bigint with auto-increment)
    if (columnName === 'id') {
      return isSnakeCase
        ? `t.bigserial("${columnName}", { mode: 'number' }).primaryKey()`
        : `t.bigserial({ mode: 'number' }).primaryKey()`;
    }

    // For foreign key columns (ending with _id)
    if (columnName.endsWith('_id')) {
      return isSnakeCase ? `t.bigint("${columnName}")` : 't.bigint()';
    }

    // If column name is snake_case, we need special handling for the field name
    if (isSnakeCase) {
      // Handle different column types
      switch (type) {
        case 'integer':
        case 'int':
        case 'int4':
          columnDeclaration = `t.integer("${columnName}")`;
          break;

        case 'smallint':
        case 'int2':
          columnDeclaration = `t.smallint("${columnName}")`;
          break;

        case 'bigint':
        case 'int8':
          columnDeclaration = `t.bigint("${columnName}")`;
          break;

        case 'serial':
        case 'serial4':
          columnDeclaration = `t.serial("${columnName}").notNull()`;
          break;

        case 'smallserial':
        case 'serial2':
          columnDeclaration = `t.smallserial("${columnName}").notNull()`;
          break;

        case 'bigserial':
        case 'serial8':
          columnDeclaration = `t.bigserial("${columnName}").notNull()`;
          break;

        case 'text':
          columnDeclaration = `t.text("${columnName}")`;
          break;

        case 'varchar':
        case 'character varying':
          if (columnDef.maxLength) {
            columnDeclaration = `t.varchar("${columnName}", { length: ${columnDef.maxLength} })`;
          } else {
            columnDeclaration = `t.varchar("${columnName}")`;
          }
          break;

        case 'char':
        case 'character': {
          const charLength = columnDef.maxLength || 1;
          columnDeclaration = `t.char("${columnName}", { length: ${charLength} })`;
          break;
        }

        case 'boolean':
        case 'bool':
          columnDeclaration = `t.boolean("${columnName}")`;
          break;

        case 'timestamp':
          columnDeclaration = `t.timestamp("${columnName}", { mode: 'string' })`;
          break;

        case 'timestamptz':
        case 'timestamp with time zone':
          columnDeclaration = `t.timestamp("${columnName}", { withTimezone: true, mode: 'string' })`;
          break;

        case 'time':
          columnDeclaration = `t.time("${columnName}", { mode: 'string' })`;
          break;

        case 'date':
          columnDeclaration = `t.date("${columnName}", { mode: 'string' })`;
          break;

        case 'uuid':
          columnDeclaration = `t.uuid("${columnName}")`;
          break;

        case 'json':
          columnDeclaration = `t.json("${columnName}")`;
          break;

        case 'jsonb':
          columnDeclaration = `t.jsonb("${columnName}")`;
          break;

        case 'numeric':
        case 'decimal':
          columnDeclaration = `t.numeric("${columnName}")`;
          break;

        case 'real':
          columnDeclaration = `t.real("${columnName}")`;
          break;

        case 'double precision':
          columnDeclaration = `t.doublePrecision("${columnName}")`;
          break;

        case 'interval':
          columnDeclaration = `t.interval("${columnName}")`;
          break;

        case 'point':
          columnDeclaration = `t.point("${columnName}")`;
          break;

        case 'line':
          columnDeclaration = `t.line("${columnName}")`;
          break;

        default:
          // Default to text for unknown types
          console.warn(
            chalk.yellow(`Unknown column type: ${type}, defaulting to text()`),
          );
          columnDeclaration = `t.text("${columnName}")`;
      }
    } else {
      // Handle different column types without the column name (for camelCase)
      switch (type) {
        case 'integer':
        case 'int':
        case 'int4':
          columnDeclaration = 't.integer()';
          break;

        case 'smallint':
        case 'int2':
          columnDeclaration = 't.smallint()';
          break;

        case 'bigint':
        case 'int8':
          columnDeclaration = 't.bigint()';
          break;

        case 'serial':
        case 'serial4':
          columnDeclaration = 't.serial().notNull()';
          break;

        case 'smallserial':
        case 'serial2':
          columnDeclaration = 't.smallserial().notNull()';
          break;

        case 'bigserial':
        case 'serial8':
          columnDeclaration = 't.bigserial().notNull()';
          break;

        case 'text':
          columnDeclaration = 't.text()';
          break;

        case 'varchar':
        case 'character varying':
          if (columnDef.maxLength) {
            columnDeclaration = `t.varchar({ length: ${columnDef.maxLength} })`;
          } else {
            columnDeclaration = 't.varchar()';
          }
          break;

        case 'char':
        case 'character': {
          const charLength = columnDef.maxLength || 1;
          columnDeclaration = `t.char({ length: ${charLength} })`;
          break;
        }

        case 'boolean':
        case 'bool':
          columnDeclaration = 't.boolean()';
          break;

        case 'timestamp':
          columnDeclaration = `t.timestamp({ mode: 'string' })`;
          break;

        case 'timestamptz':
        case 'timestamp with time zone':
          columnDeclaration = `t.timestamp({ withTimezone: true, mode: 'string' })`;
          break;

        case 'time':
          columnDeclaration = `t.time({ mode: 'string' })`;
          break;

        case 'date':
          columnDeclaration = `t.date({ mode: 'string' })`;
          break;

        case 'uuid':
          columnDeclaration = 't.uuid()';
          break;

        case 'json':
          columnDeclaration = 't.json()';
          break;

        case 'jsonb':
          columnDeclaration = 't.jsonb()';
          break;

        case 'numeric':
        case 'decimal':
          columnDeclaration = 't.numeric()';
          break;

        case 'real':
          columnDeclaration = 't.real()';
          break;

        case 'double precision':
          columnDeclaration = 't.doublePrecision()';
          break;

        case 'interval':
          columnDeclaration = 't.interval()';
          break;

        case 'point':
          columnDeclaration = 't.point()';
          break;

        case 'line':
          columnDeclaration = 't.line()';
          break;

        default:
          // Default to text for unknown types
          console.warn(
            chalk.yellow(`Unknown column type: ${type}, defaulting to text()`),
          );
          columnDeclaration = 't.text()';
      }
    }

    // Add nullable
    if (!columnDef.nullable) {
      columnDeclaration += '.notNull().default("")';
    }

    // Add default value if exists
    if (columnDef.default) {
      columnDeclaration += `.default(${columnDef.default})`;
    }
    return columnDeclaration;
  }
}
