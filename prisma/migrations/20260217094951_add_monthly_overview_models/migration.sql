-- CreateTable
CREATE TABLE "MonthlyOverview" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "janCarryOver" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyOverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupporterDonation" (
    "id" TEXT NOT NULL,
    "monthlyOverviewId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "kyatAmount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupporterDonation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionRecord" (
    "id" TEXT NOT NULL,
    "monthlyOverviewId" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "amountMMK" BIGINT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DistributionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyOverview_year_month_key" ON "MonthlyOverview"("year", "month");

-- CreateIndex
CREATE INDEX "SupporterDonation_monthlyOverviewId_idx" ON "SupporterDonation"("monthlyOverviewId");

-- CreateIndex
CREATE INDEX "DistributionRecord_monthlyOverviewId_idx" ON "DistributionRecord"("monthlyOverviewId");

-- AddForeignKey
ALTER TABLE "SupporterDonation" ADD CONSTRAINT "SupporterDonation_monthlyOverviewId_fkey" FOREIGN KEY ("monthlyOverviewId") REFERENCES "MonthlyOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionRecord" ADD CONSTRAINT "DistributionRecord_monthlyOverviewId_fkey" FOREIGN KEY ("monthlyOverviewId") REFERENCES "MonthlyOverview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
