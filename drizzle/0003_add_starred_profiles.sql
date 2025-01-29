CREATE TABLE IF NOT EXISTS "starred_profiles" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" text NOT NULL REFERENCES "user" ON DELETE CASCADE,
    "starred_id" text NOT NULL REFERENCES "user" ON DELETE CASCADE,
    "created_at" timestamp NOT NULL DEFAULT now(),
    UNIQUE("user_id", "starred_id")
);
