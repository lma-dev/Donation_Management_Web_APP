export type SupporterDonationResponse = {
  id: string;
  name: string;
  amount: string;
  currency: string;
  kyatAmount: string;
  createdAt: string;
};

export type DistributionRecordResponse = {
  id: string;
  donationPlaceId: string | null;
  recipient: string;
  amountMMK: string;
  remarks: string | null;
  createdAt: string;
};

export type MonthlyOverviewResponse = {
  id: string;
  year: number;
  month: number;
  exchangeRate: number;
  carryOver: string;
  totalCollected: string;
  totalDonated: string;
  remainingBalance: string;
  supporters: SupporterDonationResponse[];
  distributions: DistributionRecordResponse[];
  createdAt: string;
  updatedAt: string;
};
