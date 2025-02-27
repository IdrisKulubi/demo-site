CREATE TABLE "profile_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"viewer_id" text,
	"viewed_id" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" text NOT NULL,
	"reported_user_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"admin_notes" text
);
--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewer_id_user_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewed_id_user_id_fk" FOREIGN KEY ("viewed_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_user_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "viewed_idx" ON "profile_views" USING btree ("viewed_id");--> statement-breakpoint
CREATE INDEX "viewer_idx" ON "profile_views" USING btree ("viewer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_view" ON "profile_views" USING btree ("viewer_id","viewed_id");--> statement-breakpoint
CREATE INDEX "reported_user_idx" ON "reports" USING btree ("reported_user_id");--> statement-breakpoint
CREATE INDEX "report_status_idx" ON "reports" USING btree ("status");