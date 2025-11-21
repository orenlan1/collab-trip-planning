/*
  Warnings:

  - A unique constraint covering the columns `[activityId]` on the table `Flight` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Flight" ADD COLUMN     "activityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Flight_activityId_key" ON "public"."Flight"("activityId");

-- AddForeignKey
ALTER TABLE "public"."Flight" ADD CONSTRAINT "Flight_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
