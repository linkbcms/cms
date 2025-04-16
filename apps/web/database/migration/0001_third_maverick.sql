CREATE TABLE "settings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar,
	"navigation" varchar,
	"description" varchar
);
--> statement-breakpoint
CREATE TABLE "settings2" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar,
	"navigation" varchar,
	"description" varchar
);
--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "order" numeric;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "blogs_id" ADD COLUMN "order" numeric;--> statement-breakpoint
ALTER TABLE "blogs_id" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "blogs_id" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "blogs_id" DROP COLUMN "description";