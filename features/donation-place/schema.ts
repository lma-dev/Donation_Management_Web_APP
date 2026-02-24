import { z } from "zod";

export const createDonationPlaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  note: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateDonationPlaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  note: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateDonationPlaceInput = z.infer<
  typeof createDonationPlaceSchema
>;
export type UpdateDonationPlaceInput = z.infer<
  typeof updateDonationPlaceSchema
>;
