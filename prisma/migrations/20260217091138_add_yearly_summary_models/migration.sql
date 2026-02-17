-- CreateTable
CREATE TABLE "YearlySummary" (
    "id" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "totalCollected" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalDonated" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YearlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyRecord" (
    "id" TEXT NOT NULL,
    "yearId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "collectedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "donatedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "MonthlyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YearlySummary_fiscalYear_key" ON "YearlySummary"("fiscalYear");

-- CreateIndex
CREATE INDEX "MonthlyRecord_yearId_idx" ON "MonthlyRecord"("yearId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyRecord_yearId_month_key" ON "MonthlyRecord"("yearId", "month");

-- AddForeignKey
ALTER TABLE "MonthlyRecord" ADD CONSTRAINT "MonthlyRecord_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "YearlySummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
