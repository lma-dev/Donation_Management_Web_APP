export type ActivityLog = {
  id: string;
  timestamp: string;
  userId: string | null;
  userName: string;
  userRole: string;
  actionType: string;
  actionLabel: string;
  details: string;
  ipAddress: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLogFilters = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  actionType?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type ActivityLogPage = {
  data: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
};

export type ActivityLogSummary = {
  totalLogs30Days: number;
  criticalEvents: number;
  activeUsersToday: number;
  retentionDaysLeft: number;
};
