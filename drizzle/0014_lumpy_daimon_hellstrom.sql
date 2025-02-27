CREATE TABLE "contest_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contest_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"entry_type" text NOT NULL,
	"photo_url" text,
	"bio_text" text DEFAULT '',
	"caption" text DEFAULT '',
	"vote_count" integer DEFAULT 0 NOT NULL,
	"is_winner" boolean DEFAULT false,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_views" DROP CONSTRAINT "profile_views_viewer_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "profile_views" DROP CONSTRAINT "profile_views_viewed_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "viewed_idx";--> statement-breakpoint
DROP INDEX "viewer_idx";--> statement-breakpoint
DROP INDEX "unique_view";--> statement-breakpoint
ALTER TABLE "profile_views" ALTER COLUMN "viewer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_views" ALTER COLUMN "viewed_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contest_entries" ADD CONSTRAINT "contest_entries_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_entries" ADD CONSTRAINT "contest_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_votes" ADD CONSTRAINT "contest_votes_entry_id_contest_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."contest_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_votes" ADD CONSTRAINT "contest_votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entry_contest_idx" ON "contest_entries" USING btree ("contest_id");--> statement-breakpoint
CREATE INDEX "entry_user_idx" ON "contest_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "entry_winner_idx" ON "contest_entries" USING btree ("is_winner");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_vote" ON "contest_votes" USING btree ("entry_id","user_id");--> statement-breakpoint
CREATE INDEX "contest_active_idx" ON "contests" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "contest_date_idx" ON "contests" USING btree ("start_date","end_date");--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewer_id_user_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewed_id_user_id_fk" FOREIGN KEY ("viewed_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "profile_views_viewer_idx" ON "profile_views" USING btree ("viewer_id");--> statement-breakpoint
CREATE INDEX "profile_views_viewed_idx" ON "profile_views" USING btree ("viewed_id");