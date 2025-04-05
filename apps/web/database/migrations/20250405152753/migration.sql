-- Migration: 20250405152753
-- Generated at: 2025-04-05T07:27:53.228Z

-- Up Migration
BEGIN;

-- Create Tables
CREATE TABLE IF NOT EXISTS "public"."blogs" (
  "id" SERIAL PRIMARY KEY,
  "slug" varchar,
  "description" varchar,
  "content" varchar,
  "image" varchar,
  "date" varchar,
  "custom" varchar,
  "author" varchar
);

CREATE TABLE IF NOT EXISTS "public"."blogs_en" (
  "id" SERIAL PRIMARY KEY,
  "slug" varchar,
  "description" varchar,
  "content" varchar,
  "image" varchar,
  "date" varchar,
  "custom" varchar,
  "author" varchar
);

CREATE TABLE IF NOT EXISTS "public"."blogs_id" (
  "id" SERIAL PRIMARY KEY,
  "slug" varchar,
  "description" varchar,
  "content" varchar,
  "image" varchar,
  "date" varchar,
  "custom" varchar,
  "author" varchar
);

CREATE TABLE IF NOT EXISTS "public"."authors" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar
);

CREATE TABLE IF NOT EXISTS "public"."settings" (
  "id" SERIAL PRIMARY KEY,
  "title" varchar,
  "navigation" varchar,
  "description" varchar
); 

-- Create Indexes
CREATE INDEX IF NOT EXISTS "blogs_en_slug_idx" ON "public"."blogs_en" ("slug");

CREATE INDEX IF NOT EXISTS "blogs_id_slug_idx" ON "public"."blogs_id" ("slug");

COMMIT;

-- Down Migration
BEGIN;

-- Drop Tables  
DROP TABLE IF EXISTS "public"."blogs";
DROP TABLE IF EXISTS "public"."blogs_en";
DROP TABLE IF EXISTS "public"."blogs_id";
DROP TABLE IF EXISTS "public"."authors";
DROP TABLE IF EXISTS "public"."settings"; 

COMMIT;
