-- AlterTable
ALTER TABLE "DistributionRecord" ADD COLUMN     "donationPlaceId" TEXT;

-- CreateTable
CREATE TABLE "DonationPlace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonationPlace_name_key" ON "DonationPlace"("name");

-- CreateIndex
CREATE INDEX "DistributionRecord_donationPlaceId_idx" ON "DistributionRecord"("donationPlaceId");

-- AddForeignKey
ALTER TABLE "DistributionRecord" ADD CONSTRAINT "DistributionRecord_donationPlaceId_fkey" FOREIGN KEY ("donationPlaceId") REFERENCES "DonationPlace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
