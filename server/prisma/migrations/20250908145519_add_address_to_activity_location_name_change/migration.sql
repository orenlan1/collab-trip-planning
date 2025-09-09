/*
  Warnings:

  - You are about to drop the column `location` on the `Activity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Activity" DROP COLUMN "location",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "name" TEXT;
