DROP TABLE "settings" CASCADE;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "title" varchar DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs_id" ADD COLUMN "title" varchar DEFAULT '' NOT NULL;