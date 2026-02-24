export type MonthlyRecordResponse = {
  id: string;
  month: string;
  collectedAmount: string;
  donatedAmount: string;
};

export type YearlySummaryResponse = {
  id: string;
  fiscalYear: number;
  totalCollected: string;
  totalDonated: string;
  remainingBalance: string;
  monthlyRecords: MonthlyRecordResponse[];
  createdAt: string;
  updatedAt: string;
};
