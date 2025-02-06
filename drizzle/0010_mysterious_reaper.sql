ALTER TABLE "swipes" ADD COLUMN "type" text DEFAULT 'regular' NOT NULL;--> statement-breakpoint
CREATE INDEX "swipe_type_idx" ON "swipes" USING btree ("type");