CREATE INDEX "match_user1_idx" ON "matches" USING btree ("user1_id");--> statement-breakpoint
CREATE INDEX "match_user2_idx" ON "matches" USING btree ("user2_id");--> statement-breakpoint
CREATE INDEX "match_created_at_idx" ON "matches" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "match_last_message_idx" ON "matches" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "match_combo_idx" ON "matches" USING btree ("user1_id","user2_id");--> statement-breakpoint
CREATE INDEX "profile_gender_idx" ON "profiles" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "profile_last_active_idx" ON "profiles" USING btree ("last_active");--> statement-breakpoint
CREATE INDEX "profile_completed_idx" ON "profiles" USING btree ("profile_completed");--> statement-breakpoint
CREATE INDEX "swipe_swiper_idx" ON "swipes" USING btree ("swiper_id");--> statement-breakpoint
CREATE INDEX "swipe_swiped_idx" ON "swipes" USING btree ("swiped_id");--> statement-breakpoint
CREATE INDEX "swipe_created_at_idx" ON "swipes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "swipe_combo_idx" ON "swipes" USING btree ("swiper_id","swiped_id");--> statement-breakpoint
CREATE INDEX "user_last_active_idx" ON "user" USING btree ("last_active");