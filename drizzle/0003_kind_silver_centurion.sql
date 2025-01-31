CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"phone_number" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
