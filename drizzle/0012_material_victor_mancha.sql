ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user';--> statement-breakpoint
CREATE INDEX "match_id_idx" ON "messages" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "sender_id_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "messages" USING btree ("created_at");