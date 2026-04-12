-- DropForeignKey
ALTER TABLE "public"."Trip" DROP CONSTRAINT "Trip_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TripMember" DROP CONSTRAINT "TripMember_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Trip" ADD CONSTRAINT "Trip_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripMember" ADD CONSTRAINT "TripMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
