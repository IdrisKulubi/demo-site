CREATE TABLE "starred_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"starred_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "starred_profiles" ADD CONSTRAINT "starred_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starred_profiles" ADD CONSTRAINT "starred_profiles_starred_id_user_id_fk" FOREIGN KEY ("starred_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;