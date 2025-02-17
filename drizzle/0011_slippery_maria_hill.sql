DO $$ 
BEGIN 
    IF EXISTS(SELECT 1 FROM information_schema.columns 
              WHERE table_name='messages' AND column_name='sender') THEN
        ALTER TABLE "messages" DROP COLUMN "sender";
    END IF;
END $$;