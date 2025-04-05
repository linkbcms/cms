import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Up migration
export async function up(client: any) {
  // Initialize drizzle with the schema
  const db = drizzle(client, { schema });
  
  // Run the migration
  await migrate(db, {
    migrationsFolder: './'
  });
}

// Down migration
export async function down(client: any) {
  // Initialize drizzle with the schema
  const db = drizzle(client);
  
  // Implement down migration logic here
  // For example:
    await client.query(`DROP TABLE IF EXISTS "public"."settings"`);
  await client.query(`DROP TABLE IF EXISTS "public"."authors"`);
  await client.query(`DROP TABLE IF EXISTS "public"."blogs_id"`);
  await client.query(`DROP TABLE IF EXISTS "public"."blogs_en"`);
  await client.query(`DROP TABLE IF EXISTS "public"."blogs"`);
}
