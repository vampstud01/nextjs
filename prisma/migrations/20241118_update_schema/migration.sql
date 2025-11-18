-- Add missing columns to Campsite
ALTER TABLE "Campsite" ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE "Campsite" ADD COLUMN IF NOT EXISTS "intro" TEXT;

-- Add unique constraint on externalId
CREATE UNIQUE INDEX IF NOT EXISTS "Campsite_externalId_key" ON "Campsite"("externalId");

-- Update CrawlLog table structure
-- First, add new columns
ALTER TABLE "CrawlLog" ADD COLUMN IF NOT EXISTS "itemsProcessed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CrawlLog" ADD COLUMN IF NOT EXISTS "itemsCreated" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CrawlLog" ADD COLUMN IF NOT EXISTS "itemsUpdated" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CrawlLog" ADD COLUMN IF NOT EXISTS "itemsFailed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CrawlLog" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "CrawlLog" ADD COLUMN IF NOT EXISTS "message" TEXT;

-- Migrate data from old columns to new columns (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='CrawlLog' AND column_name='newItemsCount') THEN
        UPDATE "CrawlLog" SET "itemsCreated" = "newItemsCount" WHERE "itemsCreated" = 0;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='CrawlLog' AND column_name='updatedItemsCount') THEN
        UPDATE "CrawlLog" SET "itemsUpdated" = "updatedItemsCount" WHERE "itemsUpdated" = 0;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='CrawlLog' AND column_name='finishedAt') THEN
        UPDATE "CrawlLog" SET "completedAt" = "finishedAt" WHERE "completedAt" IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='CrawlLog' AND column_name='errorMessage') THEN
        UPDATE "CrawlLog" SET "message" = "errorMessage" WHERE "message" IS NULL;
    END IF;
END $$;

-- Drop old columns (optional - uncomment if you want to remove old columns)
-- ALTER TABLE "CrawlLog" DROP COLUMN IF EXISTS "newItemsCount";
-- ALTER TABLE "CrawlLog" DROP COLUMN IF EXISTS "updatedItemsCount";
-- ALTER TABLE "CrawlLog" DROP COLUMN IF EXISTS "finishedAt";
-- ALTER TABLE "CrawlLog" DROP COLUMN IF EXISTS "errorMessage";

-- Make region nullable in Campsite (as per schema.prisma)
ALTER TABLE "Campsite" ALTER COLUMN "region" DROP NOT NULL;

