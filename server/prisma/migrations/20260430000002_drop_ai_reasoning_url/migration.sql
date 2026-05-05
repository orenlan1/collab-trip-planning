-- AlterTable: drop unused legacy columns
ALTER TABLE "Activity" DROP COLUMN IF EXISTS "aiReasoning";
ALTER TABLE "Activity" DROP COLUMN IF EXISTS "url";
