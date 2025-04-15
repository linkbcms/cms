CREATE TABLE "authors" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar,
	"slug" varchar,
	"description" varchar,
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
	"slug" varchar,
	"description" varchar,
	"content" varchar,
	"image" varchar,
	"date" varchar,
	"custom" varchar,
	"author" varchar
);
