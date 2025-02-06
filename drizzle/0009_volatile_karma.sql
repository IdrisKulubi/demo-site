CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"level" integer DEFAULT 1,
	"progress" integer DEFAULT 0,
	"max_progress" integer,
	"is_secret" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "achievement_user_id_idx" ON "achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "achievement_type_idx" ON "achievements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "achievement_unlocked_at_idx" ON "achievements" USING btree ("unlocked_at");--> statement-breakpoint
CREATE INDEX "achievement_user_type_idx" ON "achievements" USING btree ("user_id","type");