/*
  Warnings:

  - The `role` column on the `TripMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."TripRole" AS ENUM ('CREATOR', 'MEMBER');

-- AlterTable
ALTER TABLE "public"."TripMember" DROP COLUMN "role",
ADD COLUMN     "role" "public"."TripRole" NOT NULL DEFAULT 'MEMBER';
