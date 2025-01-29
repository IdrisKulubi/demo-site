ALTER TABLE "user" ADD COLUMN "phone_number" text NOT NULL DEFAULT '+254700000000';
-- Set a default value temporarily to handle existing rows
-- After the migration, you should update this with real phone numbers

-- Later, if you want to remove the default, you can run:
-- ALTER TABLE "user" ALTER COLUMN "phone_number" DROP DEFAULT;
