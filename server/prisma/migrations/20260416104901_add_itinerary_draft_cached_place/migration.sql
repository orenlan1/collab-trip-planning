-- AlterTable
ALTER TABLE "public"."Activity" ADD COLUMN     "aiReasoning" TEXT;

-- CreateTable
CREATE TABLE "public"."ItineraryDraft" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CachedPlace" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "xid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kinds" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryDraft_itineraryId_key" ON "public"."ItineraryDraft"("itineraryId");

-- CreateIndex
CREATE UNIQUE INDEX "CachedPlace_xid_key" ON "public"."CachedPlace"("xid");

-- CreateIndex
CREATE INDEX "CachedPlace_city_idx" ON "public"."CachedPlace"("city");

-- AddForeignKey
ALTER TABLE "public"."ItineraryDraft" ADD CONSTRAINT "ItineraryDraft_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "public"."Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
