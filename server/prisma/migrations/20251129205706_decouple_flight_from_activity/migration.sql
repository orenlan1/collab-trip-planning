/*
  Warnings:

  - You are about to drop the column `activityId` on the `Flight` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Flight" DROP CONSTRAINT "Flight_activityId_fkey";

-- DropIndex
DROP INDEX "public"."Expense_activityId_idx";

-- DropIndex
DROP INDEX "public"."Expense_flightId_idx";

-- DropIndex
DROP INDEX "public"."Flight_activityId_key";

-- AlterTable
ALTER TABLE "public"."Flight" DROP COLUMN "activityId";
