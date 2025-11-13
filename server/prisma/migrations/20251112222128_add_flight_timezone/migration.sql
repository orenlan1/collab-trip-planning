/*
  Warnings:

  - Added the required column `arrivalTimezoneId` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureTimezoneId` to the `Flight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Flight" ADD COLUMN     "arrivalTimezoneId" TEXT NOT NULL,
ADD COLUMN     "departureTimezoneId" TEXT NOT NULL;
