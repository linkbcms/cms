
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "/Users/vincent/Bootcamp/code/cms/cms/apps/web/database/schema/schema.ts",
  out: "./database/migration",
  dbCredentials: {
    url: "postgresql://postgres.pmgkkjqaqrqtxftcasyt:1clhltmPzoD3Xo19@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
  },
  verbose: false,
  strict: true,
});
