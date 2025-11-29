/*
  Warnings:

  - A unique constraint covering the columns `[flightId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "flightId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_flightId_key" ON "public"."Expense"("flightId");

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "public"."Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
