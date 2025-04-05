import { AnyPgColumn } from "drizzle-orm/pg-core";
import { pgEnum, pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enum definitions


// Table definitions
export const blogs = table(
  "blogs",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity()
  }
);

export const blogs_en = table(
  "blogs_en",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity()
  }
);

export const blogs_id = table(
  "blogs_id",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity()
  }
);

export const authors = table(
  "authors",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity()
  }
);

export const settings = table(
  "settings",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity()
  }
);

// Helper function for generating unique strings
export function generateUniqueString(length: number = 16): string {
  return sql`substr(md5(random()::text), 0, ${length})`.as<string>();
}
