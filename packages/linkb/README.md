# linkb CMS CLI

A command-line interface tool for the linkb Content Management System.

## Installation

### Using npm

```bash
npm install -g @linkbcms/cli
```

### Using yarn

```bash
yarn global add @linkbcms/cli
```

### Using pnpm

```bash
pnpm add -g @linkbcms/cli
```

### Using npx

You can also use it directly without installation:

```bash
npx @linkbcms/cli [command]
```

## Prerequisites

Before using the linkb CLI, ensure you have:

1. A `.env` file in your project directory with the following variables:
   - `DATABASE_TYPE`: The type of database you're using
   - `DATABASE_URL`: The connection string for your database

2. A `cms.config.tsx` file in your project directory

## Usage

Running the command without arguments will display the help menu:

```bash
linkb
```

### Creating a New Application

You can create a new linkb application using the create-app command:

```bash
linkb create-app my-app
```

Or using npx directly:

```bash
npx linkb create-app my-app
```

The create-app command accepts the following options:

- `-t, --template <name>`: Template to use (default: basic)
- `--use-npm`: Use npm as the package manager
- `--use-yarn`: Use yarn as the package manager
- `--use-pnpm`: Use pnpm as the package manager

This will create a new application based on the specified template. The dependencies will be automatically installed.

### Database Operations

The CLI provides several database management commands:

```bash
linkb db [command]
```

Available database commands:

- `gen-schema`: Generate database migration from your CMS configuration
  ```bash
  linkb db gen-schema
  ```

- `migrate`: Run database migrations
  ```bash
  linkb db migrate
  ```

- `status`: Check migration status
  ```bash
  linkb db status
  ```

- `test-connection`: Test database connectivity
  ```bash
  linkb db test-connection
  ```

## Error Handling

The CLI will check for:
- Existence of `.env` file
- Required environment variables
- Existence of `cms.config.tsx` file
- Proper execution of database operations

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## License

MIT 