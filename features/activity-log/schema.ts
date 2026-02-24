import { z } from "zod";

export const createActivityLogSchema = z.object({
  timestamp: z.string().datetime().optional(),
  userId: z.string().optional(),
  userName: z.string().min(1, "User name is required"),
  userRole: z.string().min(1, "User role is required"),
  actionType: z.string().min(1, "Action type is required"),
  actionLabel: z.string().min(1, "Action label is required"),
  details: z.string().min(1, "Details are required"),
  ipAddress: z.string().optional(),
  status: z.enum(["Success", "Verified", "Alert"]).default("Success"),
});

export const activityLogFiltersSchema = z.object({
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  actionType: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>;
export type ActivityLogFiltersInput = z.infer<typeof activityLogFiltersSchema>;
