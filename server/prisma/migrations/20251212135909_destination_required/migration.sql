/*
  Warnings:

  - Made the column `destination` on table `Trip` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Trip" ALTER COLUMN "destination" SET NOT NULL;
