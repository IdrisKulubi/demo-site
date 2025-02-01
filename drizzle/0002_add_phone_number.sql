ALTER TABLE "user" ALTER COLUMN "phone_number" SET DEFAULT '0700000000';
-- Set a default value temporarily to handle existing rows
-- After the migration, you should update this with real phone numbers

-- Later, if you want to remove the default, you can run:
-- ALTER TABLE "user" ALTER COLUMN "phone_number" DROP DEFAULT;
