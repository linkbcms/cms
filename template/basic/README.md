# LinkbCMS Basic Example

This example demonstrates a basic setup of LinkbCMS, showing core functionality and essential features.

## Features

- Basic content management
- Simple page routing

## Getting Started

1. Create a new LinkbCMS project:

    ```bash
    pnpm dlx @linkbcms/cli@latest create-app my-app
    ```

2. Start the development server:

    ```bash
    cd my-app
    ```

3. Add ENV variables:

    You can use Supabase or Postgres as a database. <https://supabase.com/>

    ```bash
    DATABASE_URL="***" # Supabase URL
    DATABASE_TYPE="supabase"
    ```

4. Generate Schema:

    ```bash
    pnpm dlx @linkbcms/cli@latest db gen-schema
    ```

5. Migrate Database:

    ```bash
    pnpm dlx @linkbcms/cli@latest db migrate
    ```

6. Open your browser and navigate to `http://localhost:3000/cms` to see the CMS in action.
