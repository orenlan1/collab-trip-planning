/*
  Warnings:

  - A unique constraint covering the columns `[lodgingId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "lodgingId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_lodgingId_key" ON "public"."Expense"("lodgingId");

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_lodgingId_fkey" FOREIGN KEY ("lodgingId") REFERENCES "public"."Lodging"("id") ON DELETE CASCADE ON UPDATE CASCADE;
