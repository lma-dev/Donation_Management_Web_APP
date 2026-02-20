import { z } from "zod";

export const monthlyQuerySchema = z.object({
  year: z.coerce
    .number()
    .int("Year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier"),
  month: z.coerce
    .number()
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
});

export const createMonthlySchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  exchangeRate: z.number().positive("Exchange rate must be positive"),
  carryOver: z.number().int().min(0, "Carry over must be non-negative"),
});

export const createSupporterSchema = z.object({
  monthlyOverviewId: z.string().min(1, "Monthly overview ID is required"),
  name: z.string().min(1, "Name is required"),
  amount: z.number().int().min(0, "Amount must be non-negative"),
  currency: z.enum(["JPY", "MMK"], {
    message: "Currency must be JPY or MMK",
  }),
  kyatAmount: z.number().int().min(0, "Kyat amount must be non-negative"),
});

export const createDistributionSchema = z.object({
  monthlyOverviewId: z.string().min(1, "Monthly overview ID is required"),
  donationPlaceId: z.string().min(1, "Donation place is required"),
  recipient: z.string().min(1, "Recipient is required"),
  amountMMK: z.number().int().min(0, "Amount must be non-negative"),
  remarks: z.string().optional(),
});

export const updateExchangeRateSchema = z.object({
  id: z.string().min(1, "Monthly overview ID is required"),
  exchangeRate: z.number().positive("Exchange rate must be positive"),
});

export const monthlyExportSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  type: z.enum(["excel", "pdf", "json"], {
    message: "Type must be one of: excel, pdf, json",
  }),
});

export type MonthlyQuery = z.infer<typeof monthlyQuerySchema>;
export type CreateMonthly = z.infer<typeof createMonthlySchema>;
export type CreateSupporter = z.infer<typeof createSupporterSchema>;
export type CreateDistribution = z.infer<typeof createDistributionSchema>;
export type UpdateExchangeRate = z.infer<typeof updateExchangeRateSchema>;
export type MonthlyExportQuery = z.infer<typeof monthlyExportSchema>;
