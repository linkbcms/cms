# @linkbcms/database

Database module for the LinkB CMS, providing database schema generation and management functionality.

## Features

- Database adapters for PostgreSQL (and future support for other databases)
- Schema generation from CMS configuration
- Migration management
- Database utilities for connecting and interacting with the database

## Installation

```sh
npm install @linkbcms/database
```

## Usage

### Basic usage

```typescript
import { execute } from '@linkbcms/database';

// Execute a database action
await execute('gen-schema', {
  databaseType: 'postgres',
  connectionString: 'postgresql://user:password@localhost:5432/mydb',
  schemaDir: './database/schema',
  migrationDir: './database/migrations',
  configPath: './cms.config.tsx'
});
```

### Available actions

- `gen-schema`: Generate database schema based on CMS configuration
- `migrate`: Run pending migrations
- `test-connection`: Test database connectivity
- `reset`: Reset database by dropping all tables

## API Reference

### execute(action, options)

Execute a database action with the specified options.

**Parameters:**

- `action`: The action to execute (string)
- `options`: Configuration options object:
  - `workspaceRoot`: Root directory of the workspace
  - `databaseType`: Type of database to connect to
  - `connectionString`: Database connection string
  - `schema`: Database schema name
  - `schemaDir`: Directory for schema files
  - `migrationDir`: Directory for migration files
  - `configPath`: Path to the CMS configuration file
  - `loadConfigFn`: Function to load the CMS configuration

## License

MIT 