# linkb

A command line tool built with TypeScript and Commander.js.

## Installation

```bash
npm install -g linkb
```

Or use it directly with npx:

```bash
npx linkb
```

## Usage

### Hello Command

```bash
linkb hello [name] --color <color>
```

Options:
- `--color, -c`: Text color (default: "green")

Example:
```bash
linkb hello John --color blue
```

### List Command

```bash
linkb list
```

Displays a list of items.

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