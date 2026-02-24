export type TrashResourceType =
  | "users"
  | "donation-places"
  | "supporter-donations"
  | "distribution-records";

export type DeletedUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  deletedAt: string;
  createdAt: string;
};

export type DeletedDonationPlace = {
  id: string;
  name: string;
  note: string | null;
  isActive: boolean;
  deletedAt: string;
  createdAt: string;
};

export type DeletedSupporterDonation = {
  id: string;
  name: string;
  amount: string;
  currency: string;
  kyatAmount: string;
  deletedAt: string;
  createdAt: string;
  monthlyOverview: { year: number; month: number };
};

export type DeletedDistributionRecord = {
  id: string;
  recipient: string;
  amountMMK: string;
  remarks: string | null;
  deletedAt: string;
  createdAt: string;
  monthlyOverview: { year: number; month: number };
  donationPlace: { name: string } | null;
};
