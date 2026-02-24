import { z } from "zod";

export const yearlyQuerySchema = z.object({
  year: z.coerce
    .number()
    .int("Year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier"),
});

export const exportQuerySchema = z.object({
  year: z.coerce
    .number()
    .int("Year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier"),
  type: z.enum(["excel", "pdf", "json"], {
    message: "Type must be one of: excel, pdf, json",
  }),
});

export type YearlyQuery = z.infer<typeof yearlyQuerySchema>;
export type ExportQuery = z.infer<typeof exportQuerySchema>;
