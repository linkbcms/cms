// Generated schema file
import { pgTable as table } from "@linkbcms/database";
import * as t from "@linkbcms/database";

export const defaultSchema = table
export const blogs = defaultSchema(
  "blogs",
  {
    id: t.bigserial({ mode: 'number' }).primaryKey(),
    title: t.varchar(),
    order: t.integer(),
    status: t.text(),
    slug: t.varchar(),
    content: t.varchar(),
    image: t.varchar(),
    date: t.varchar(),
    custom: t.varchar(),
    author: t.varchar(),
  }
);

export const blogsid = defaultSchema(
  "blogs_id",
  {
    id: t.bigserial({ mode: 'number' }).primaryKey(),
    title: t.varchar(),
    order: t.integer(),
    status: t.text(),
    slug: t.varchar(),
    content: t.varchar(),
    image: t.varchar(),
    date: t.varchar(),
    custom: t.varchar(),
    author: t.varchar(),
  }
);

export const authors = defaultSchema(
  "authors",
  {
    id: t.bigserial({ mode: 'number' }).primaryKey(),
    name: t.varchar(),
  }
);

export const settings = defaultSchema(
  "settings",
  {
    id: t.bigserial({ mode: 'number' }).primaryKey(),
    title: t.varchar(),
    navigation: t.varchar(),
    description: t.varchar(),
    number: t.integer(),
    select: t.text(),
  }
);

export const settings2 = defaultSchema(
  "settings2",
  {
    id: t.bigserial({ mode: 'number' }).primaryKey(),
    title: t.varchar(),
    navigation: t.varchar(),
    description: t.varchar(),
  }
);

