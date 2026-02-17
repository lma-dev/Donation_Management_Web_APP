import {
  createActivityLogSchema,
  activityLogFiltersSchema,
} from "../schema";
import {
  findActivityLogs,
  findActivityLogSummary,
  findAllActivityLogs,
  createActivityLog as createInDb,
} from "../data";
import { ActivityLogError } from "../error";

export async function listActivityLogs(rawFilters: unknown) {
  const parsed = activityLogFiltersSchema.safeParse(rawFilters);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new ActivityLogError(firstError, "VALIDATION_ERROR");
  }

  const { data, total } = await findActivityLogs(parsed.data);

  return {
    data,
    total,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
  };
}

export async function getActivityLogSummary() {
  return findActivityLogSummary();
}

export async function getAllActivityLogs(rawFilters: unknown) {
  const parsed = activityLogFiltersSchema.safeParse(rawFilters);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new ActivityLogError(firstError, "VALIDATION_ERROR");
  }

  return findAllActivityLogs(parsed.data);
}

export async function logActivity(input: unknown) {
  const parsed = createActivityLogSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new ActivityLogError(firstError, "VALIDATION_ERROR");
  }

  return createInDb(parsed.data);
}
