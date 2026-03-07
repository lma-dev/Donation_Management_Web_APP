-- DropIndex
DROP INDEX "DistributionRecord_monthlyOverviewId_idx";

-- DropIndex
DROP INDEX "SupporterDonation_monthlyOverviewId_idx";

-- CreateIndex
CREATE INDEX "DistributionRecord_monthlyOverviewId_deletedAt_idx" ON "DistributionRecord"("monthlyOverviewId", "deletedAt");

-- CreateIndex
CREATE INDEX "DonationPlace_deletedAt_idx" ON "DonationPlace"("deletedAt");

-- CreateIndex
CREATE INDEX "MonthlyOverview_year_deletedAt_idx" ON "MonthlyOverview"("year", "deletedAt");

-- CreateIndex
CREATE INDEX "MonthlyOverview_deletedAt_idx" ON "MonthlyOverview"("deletedAt");

-- CreateIndex
CREATE INDEX "SupporterDonation_monthlyOverviewId_deletedAt_idx" ON "SupporterDonation"("monthlyOverviewId", "deletedAt");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_email_deletedAt_idx" ON "User"("email", "deletedAt");
