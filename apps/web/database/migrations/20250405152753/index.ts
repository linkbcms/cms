import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Schema definitions


// Table definitions
export const blogs = table(
  "blogs",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: t.varchar().$default(() => generateUniqueString(16)),
    description: t.varchar(),
    content: t.varchar(),
    image: t.varchar(),
    date: t.varchar(),
    custom: t.varchar(),
    author: t.varchar()
  },
  (table) => [
    t.uniqueIndex("slug_idx").on(table.slug)
  ]
);

export const blogs_en = table(
  "blogs_en",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: t.varchar().$default(() => generateUniqueString(16)),
    description: t.varchar(),
    content: t.varchar(),
    image: t.varchar(),
    date: t.varchar(),
    custom: t.varchar(),
    author: t.varchar()
  },
  (table) => [
    t.uniqueIndex("slug_idx").on(table.slug)
  ]
);

export const blogs_id = table(
  "blogs_id",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: t.varchar().$default(() => generateUniqueString(16)),
    description: t.varchar(),
    content: t.varchar(),
    image: t.varchar(),
    date: t.varchar(),
    custom: t.varchar(),
    author: t.varchar()
  },
  (table) => [
    t.uniqueIndex("slug_idx").on(table.slug)
  ]
);

export const authors = table(
  "authors",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar()
  }
);

export const settings = table(
  "settings",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    title: t.varchar(),
    navigation: t.varchar(),
    description: t.varchar()
  }
);

// Helper function for generating unique strings
export function generateUniqueString(length: number = 16) {
  return sql`substr(md5(random()::text), 0, ${length})`;
}
