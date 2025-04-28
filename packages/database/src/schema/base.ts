import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
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
  schema: string;
}

/**
 * Base class for schema generators
 * This provides the common interface and shared functionality for all schema generators
 */
export abstract class BaseSchemaGenerator {
  protected schemaDir: string;
  protected schema: string;
  protected config: ReturnType<typeof defineConfig>;

  constructor(options: SchemaGeneratorOptions) {
    this.schemaDir = options.schemaDir;
    this.schema = options.schema;
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
import { pgTable as table } from "@linkbcms/database";
import * as t from "@linkbcms/database";

export const defaultSchema = ${this.schema ? `t.pgSchema("${this.schema}").table` : 'table'}
`;

      // Generate table declarations
      for (const [tableName, tableSchema] of Object.entries(schema)) {
        // Check if table has any references (for index generation)
        const hasReferences = Object.values(tableSchema).some(
          (col) =>
            col.type.toLowerCase().includes('references') ||
            (col as any).references !== undefined,
        );

        schemaFileContent += `export const ${this.camelCase(tableName)} = defaultSchema(\n`;
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

    const columnDeclaration = this.getColumnTypeDeclaration(
      type,
      columnDef,
      isSnakeCase ? columnName : undefined,
    );

    return columnDeclaration;
  }

  /**
   * Get the appropriate Drizzle column type declaration based on the database type
   */
  private getColumnTypeDeclaration(
    type: string,
    columnDef: ColumnDefinition,
    columnName?: string,
  ): string {
    // Create the column name parameter for the function call if it exists
    const nameParam = columnName ? `"${columnName}"` : '';

    // Handle different column types
    switch (type) {
      case 'integer':
      case 'int':
      case 'int4':
        return this.buildColumnDeclaration('integer', nameParam);

      case 'smallint':
      case 'int2':
        return this.buildColumnDeclaration('smallint', nameParam);

      case 'bigint':
      case 'int8':
        return this.buildColumnDeclaration('bigint', nameParam);

      case 'serial':
      case 'serial4':
        return `${this.buildColumnDeclaration('serial', nameParam)}.notNull()`;

      case 'smallserial':
      case 'serial2':
        return `${this.buildColumnDeclaration('smallserial', nameParam)}.notNull()`;

      case 'bigserial':
      case 'serial8':
        return `${this.buildColumnDeclaration('bigserial', nameParam)}.notNull()`;

      case 'text':
        return this.buildColumnDeclaration('text', nameParam);

      case 'varchar':
      case 'character varying':
        if (columnDef.maxLength) {
          const options = `{ length: ${columnDef.maxLength} }`;
          return this.buildColumnDeclaration('varchar', nameParam, options);
        }
        return this.buildColumnDeclaration('varchar', nameParam);

      case 'char':
      case 'character': {
        const charLength = columnDef.maxLength || 1;
        const options = `{ length: ${charLength} }`;
        return this.buildColumnDeclaration('char', nameParam, options);
      }

      case 'boolean':
      case 'bool':
        return this.buildColumnDeclaration('boolean', nameParam);

      case 'timestamp':
        return this.buildColumnDeclaration(
          'timestamp',
          nameParam,
          `{ mode: 'string' }`,
        );

      case 'timestamptz':
      case 'timestamp with time zone':
        return this.buildColumnDeclaration(
          'timestamp',
          nameParam,
          `{ withTimezone: true, mode: 'string' }`,
        );

      case 'time':
        return this.buildColumnDeclaration(
          'time',
          nameParam,
          `{ mode: 'string' }`,
        );

      case 'date':
        return this.buildColumnDeclaration(
          'date',
          nameParam,
          `{ mode: 'string' }`,
        );

      case 'uuid':
        return this.buildColumnDeclaration('uuid', nameParam);

      case 'json':
        return this.buildColumnDeclaration('json', nameParam);

      case 'jsonb':
        return this.buildColumnDeclaration('jsonb', nameParam);

      case 'numeric':
      case 'decimal':
        return this.buildColumnDeclaration('numeric', nameParam);

      case 'real':
        return this.buildColumnDeclaration('real', nameParam);

      case 'double precision':
        return this.buildColumnDeclaration('doublePrecision', nameParam);

      case 'interval':
        return this.buildColumnDeclaration('interval', nameParam);

      case 'point':
        return this.buildColumnDeclaration('point', nameParam);

      case 'line':
        return this.buildColumnDeclaration('line', nameParam);

      default:
        // Default to text for unknown types
        console.warn(
          chalk.yellow(`Unknown column type: ${type}, defaulting to text()`),
        );
        return this.buildColumnDeclaration('text', nameParam);
    }
  }

  /**
   * Build a column declaration with the correct syntax based on parameters
   */
  private buildColumnDeclaration(
    columnType: string,
    nameParam: string,
    options?: string,
  ): string {
    if (nameParam && options) {
      return `t.${columnType}(${nameParam}, ${options})`;
    }
    if (nameParam) {
      return `t.${columnType}(${nameParam})`;
    }
    if (options) {
      return `t.${columnType}(${options})`;
    }
    return `t.${columnType}()`;
  }
}
