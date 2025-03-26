import { join } from "path";
import fs from "fs";
import { defineConfig } from "../type";
import { Client } from "pg";

interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  maxLength: number | null;
}

interface TableDefinition {
  [columnName: string]: ColumnDefinition;
}

interface TableColumns {
  [columnName: string]: ColumnDefinition;
}

interface SchemaDefinition {
  [tableName: string]: TableDefinition;
}

interface SchemaDifference {
  type: 'added' | 'removed' | 'modified';
  columns?: TableColumns;
  changes?: {
    [columnName: string]: {
      type: 'added' | 'removed' | 'modified';
      definition?: ColumnDefinition;
      old?: ColumnDefinition;
      new?: ColumnDefinition;
    };
  };
}

interface SchemaDifferences {
  [tableName: string]: SchemaDifference;
}

async function getCurrentDatabaseSchema(client: Client, schema: string): Promise<SchemaDefinition> {
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = $1 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `, [schema]);

  const schemaSnapshot: SchemaDefinition = {};

  for (const table of tables.rows) {
    const columns = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = $1
      AND table_name = $2
      ORDER BY ordinal_position
    `, [schema, table.table_name]);

    const tableColumns: TableDefinition = {};
    columns.rows.forEach(col => {
      tableColumns[col.column_name] = {
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        default: col.column_default,
        maxLength: col.character_maximum_length
      };
    });
    schemaSnapshot[table.table_name] = tableColumns;
  }

  return schemaSnapshot;
}

export default async function GenerateSchema(
  schemaDir: string,
  config: ReturnType<typeof defineConfig>
) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();

    const schema = process.env.DATABASE_SCHEMA || 'public';
    // Get current database schema
    const currentSchema = await getCurrentDatabaseSchema(client, schema);
    
    // Save current schema to a file
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
    // const snapshotPath = join(schemaDir, "schema", `schema_snapshot_${timestamp}.json`);
    
    // fs.writeFileSync(snapshotPath, JSON.stringify(currentSchema, null, 2));
    // console.log(`Schema snapshot saved to: ${snapshotPath}`);

    // console.log(client)
    
    // Compare with new schema if collections are defined
    if (config.collections) {
      let newSchema: SchemaDefinition = {};
      for (const collection of Object.values(config.collections)) {
        // Process collection schema
        // ... existing collection processing code ...
      }

      // Compare schemas and generate migration
      const differences = compareSchemas(currentSchema, newSchema);
      if (Object.keys(differences).length > 0) {
        console.log('Schema differences found:');
        console.log(JSON.stringify(differences, null, 2));
        
        // Generate migration file
        const migrationName = `schema_update_${timestamp}`;
        const migrationPath = join(schemaDir, "migrations", `${timestamp}_${migrationName}.ts`);
        
        const migrationContent = generateMigrationContent(differences, schema);
        fs.writeFileSync(migrationPath, migrationContent);
        console.log(`Migration file created: ${migrationPath}`);
      }
    }
  } catch (error) {
    console.error('Error generating schema:', error);
  } finally {
    await client.end();
  }
}

function compareSchemas(current: SchemaDefinition, newSchema: SchemaDefinition): SchemaDifferences {
  const differences: SchemaDifferences = {};

  // Compare tables
  const currentTables = new Set(Object.keys(current));
  const newTables = new Set(Object.keys(newSchema));

  // Find added tables
  for (const table of newTables) {
    if (!currentTables.has(table)) {
      differences[table] = { type: 'added', columns: newSchema[table] };
    }
  }

  // Find removed tables
  for (const table of currentTables) {
    if (!newTables.has(table)) {
      differences[table] = { type: 'removed', columns: current[table] };
    }
  }

  // Compare columns in existing tables
  for (const table of currentTables) {
    if (newTables.has(table)) {
      const currentColumns = new Map(Object.entries(current[table]));
      const newColumns = new Map(Object.entries(newSchema[table]));

      const tableDiff: SchemaDifferences[string]['changes'] = {};

      // Find added columns
      for (const [name, col] of newColumns) {
        if (!currentColumns.has(name)) {
          tableDiff[name] = { type: 'added', definition: col };
        }
      }

      // Find removed columns
      for (const [name, col] of currentColumns) {
        if (!newColumns.has(name)) {
          tableDiff[name] = { type: 'removed', definition: col };
        }
      }

      // Find modified columns
      for (const [name, col] of currentColumns) {
        if (newColumns.has(name)) {
          const newCol = newColumns.get(name);
          if (JSON.stringify(col) !== JSON.stringify(newCol)) {
            tableDiff[name] = { 
              type: 'modified', 
              old: col, 
              new: newCol 
            };
          }
        }
      }

      if (Object.keys(tableDiff).length > 0) {
        differences[table] = { type: 'modified', changes: tableDiff };
      }
    }
  }

  return differences;
}

function generateMigrationContent(differences: SchemaDifferences, schema: string): string {
  const upQueries: string[] = [];
  const downQueries: string[] = [];

  for (const [table, diff] of Object.entries(differences)) {
    if (diff.type === 'added' && diff.columns) {
      // Create table
      const columns = Object.values(diff.columns).map(col => {
        let def = `"${col.name}" ${col.type}`;
        if (col.maxLength) def += `(${col.maxLength})`;
        if (!col.nullable) def += ' NOT NULL';
        if (col.default) def += ` DEFAULT ${col.default}`;
        return def;
      }).join(',\n  ');

      upQueries.push(`CREATE TABLE "${schema}"."${table}" (\n  ${columns}\n);`);
      downQueries.push(`DROP TABLE "${schema}"."${table}";`);
    } else if (diff.type === 'removed' && diff.columns) {
      // Drop table
      upQueries.push(`DROP TABLE "${schema}"."${table}";`);
      downQueries.push(`CREATE TABLE "${schema}"."${table}" (\n  ${Object.values(diff.columns).map(col => {
        let def = `"${col.name}" ${col.type}`;
        if (col.maxLength) def += `(${col.maxLength})`;
        if (!col.nullable) def += ' NOT NULL';
        if (col.default) def += ` DEFAULT ${col.default}`;
        return def;
      }).join(',\n  ')}\n);`);
    } else if (diff.type === 'modified' && diff.changes) {
      // Handle column changes
      for (const [column, change] of Object.entries(diff.changes)) {
        if (change.type === 'added' && change.definition) {
          upQueries.push(`ALTER TABLE "${schema}"."${table}" ADD COLUMN "${column}" ${change.definition.type}${change.definition.maxLength ? `(${change.definition.maxLength})` : ''}${!change.definition.nullable ? ' NOT NULL' : ''}${change.definition.default ? ` DEFAULT ${change.definition.default}` : ''};`);
          downQueries.push(`ALTER TABLE "${schema}"."${table}" DROP COLUMN "${column}";`);
        } else if (change.type === 'removed' && change.definition) {
          upQueries.push(`ALTER TABLE "${schema}"."${table}" DROP COLUMN "${column}";`);
          downQueries.push(`ALTER TABLE "${schema}"."${table}" ADD COLUMN "${column}" ${change.definition.type}${change.definition.maxLength ? `(${change.definition.maxLength})` : ''}${!change.definition.nullable ? ' NOT NULL' : ''}${change.definition.default ? ` DEFAULT ${change.definition.default}` : ''};`);
        } else if (change.type === 'modified' && change.old && change.new) {
          // Handle column modifications
          if (change.old.type !== change.new.type) {
            upQueries.push(`ALTER TABLE "${schema}"."${table}" ALTER COLUMN "${column}" TYPE ${change.new.type}${change.new.maxLength ? `(${change.new.maxLength})` : ''};`);
            downQueries.push(`ALTER TABLE "${schema}"."${table}" ALTER COLUMN "${column}" TYPE ${change.old.type}${change.old.maxLength ? `(${change.old.maxLength})` : ''};`);
          }
          if (change.old.nullable !== change.new.nullable) {
            upQueries.push(`ALTER TABLE "${schema}"."${table}" ALTER COLUMN "${column}" ${change.new.nullable ? 'DROP NOT NULL' : 'SET NOT NULL'};`);
            downQueries.push(`ALTER TABLE "${schema}"."${table}" ALTER COLUMN "${column}" ${change.old.nullable ? 'DROP NOT NULL' : 'SET NOT NULL'};`);
          }
          if (change.old.default !== change.new.default) {
            if (change.new.default) {
              upQueries.push(`ALTER TABLE "${schema}"."${table}" ALTER COLUMN "${column}" SET DEFAULT ${change.new.default};`);
            } else {
              upQueries.push(`ALTER TABLE "${schema}"."${table}" ALTER COLUMN "${column}" DROP DEFAULT;`);
            }
            if (change.old.default) {
              downQueries.push(`ALTER TABLE "${schema}"."${table}" ALTER COLUMN "${column}" SET DEFAULT ${change.old.default};`);
            } else {
              downQueries.push(`ALTER TABLE "${schema}"."${table}" ALTER COLUMN "${column}" DROP DEFAULT;`);
            }
          }
        }
      }
    }
  }

  return `/**
 * Auto-generated migration
 * Generated at: ${new Date().toISOString()}
 */

export async function up({ db, client, schema }) {
${upQueries.map(q => `  await client.query(\`${q}\`);`).join('\n')}
}

export async function down({ db, client, schema }) {
${downQueries.map(q => `  await client.query(\`${q}\`);`).join('\n')}
}
`;
}