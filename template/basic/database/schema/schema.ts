// Generated schema file
import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const blogs = table(
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

export const blogsid = table(
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

export const authors = table(
  "authors",
  {
    id: t.bigserial({ mode: 'number' }).primaryKey(),
    name: t.varchar(),
  }
);

export const settings = table(
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

export const settings2 = table(
  "settings2",
  {
    id: t.bigserial({ mode: 'number' }).primaryKey(),
    title: t.varchar(),
    navigation: t.varchar(),
    description: t.varchar(),
  }
);

