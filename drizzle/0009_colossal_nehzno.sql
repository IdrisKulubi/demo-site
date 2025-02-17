
--> statement-breakpoint
ALTER TABLE "message" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "message" CASCADE;--> statement-breakpoint
DROP INDEX "match_user1_idx";--> statement-breakpoint
DROP INDEX "match_user2_idx";--> statement-breakpoint
DROP INDEX "match_created_at_idx";--> statement-breakpoint
DROP INDEX "match_last_message_idx";--> statement-breakpoint
DROP INDEX "match_combo_idx";--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_users_idx" ON "matches" USING btree ("user1_id","user2_id");--> statement-breakpoint
CREATE INDEX "last_message_idx" ON "matches" USING btree ("last_message_at");