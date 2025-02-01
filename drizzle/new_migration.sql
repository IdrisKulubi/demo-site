-- Drop existing constraints
ALTER TABLE "account" DROP CONSTRAINT "account_userId_user_id_fk";
-- ... drop other constraints referencing "user"

-- Rename table from "user" to "users"
ALTER TABLE "user" RENAME TO "users";

-- Recreate all foreign key constraints with correct table name
ALTER TABLE "account" ADD CONSTRAINT "account_userId_users_id_fk" 
  FOREIGN KEY ("userId") REFERENCES "users"(id) ON DELETE CASCADE;
-- ... recreate other constraints 