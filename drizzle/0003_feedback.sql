CREATE TABLE IF NOT EXISTS "feedback" (
    "id" text PRIMARY KEY NOT NULL,
    "message" text NOT NULL,
    "status" text NOT NULL DEFAULT 'new',
    "created_at" timestamp DEFAULT now() NOT NULL
);
