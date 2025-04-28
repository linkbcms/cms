CREATE TABLE "authors" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar,
	"order" integer,
	"status" text,
	"slug" varchar,
	"content" varchar,
	"image" varchar,
	"date" varchar,
	"custom" varchar,
	"author" varchar
);
--> statement-breakpoint
CREATE TABLE "blogs_id" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar,
	"order" integer,
	"status" text,
	"slug" varchar,
	"content" varchar,
	"image" varchar,
	"date" varchar,
	"custom" varchar,
	"author" varchar
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar,
	"navigation" varchar,
	"description" varchar,
	"number" integer,
	"select" text
);
--> statement-breakpoint
CREATE TABLE "settings2" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar,
	"navigation" varchar,
	"description" varchar
);
