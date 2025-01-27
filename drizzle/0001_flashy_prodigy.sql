ALTER TABLE "profiles" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "is_complete" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "profile_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "looking_for" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "course" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "year_of_study" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "spotify" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "snapchat" text;