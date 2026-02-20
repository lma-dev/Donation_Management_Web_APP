"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

const ACTION_TYPE_KEYS = [
  { key: "added", value: "Added" },
  { key: "updated", value: "Updated" },
  { key: "deleted", value: "Deleted" },
  { key: "login", value: "Login" },
  { key: "loginFailed", value: "Login Failed" },
  { key: "changedPassword", value: "Changed Password" },
  { key: "export", value: "Export" },
  { key: "system", value: "System" },
];

type ActivityLogFiltersProps = {
  userName: string;
  dateFrom: string;
  dateTo: string;
  actionType: string;
  onUserNameChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onActionTypeChange: (value: string) => void;
  onClearAll: () => void;
};

export function ActivityLogFilters({
  userName,
  dateFrom,
  dateTo,
  actionType,
  onUserNameChange,
  onDateFromChange,
  onDateToChange,
  onActionTypeChange,
  onClearAll,
}: ActivityLogFiltersProps) {
  const t = useTranslations("activityLogs");
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const hasFilters = userName || dateFrom || dateTo || actionType;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={userName}
        onChange={(e) => onUserNameChange(e.target.value)}
        className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
      >
        <option value="">{t("allUsers")}</option>
        {users.map((user) => (
          <option key={user.id} value={user.name ?? user.email}>
            {user.name ?? user.email}
          </option>
        ))}
      </select>
      <Input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        className="w-auto"
        placeholder="From"
      />
      <Input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        className="w-auto"
        placeholder="To"
      />
      <select
        value={actionType}
        onChange={(e) => onActionTypeChange(e.target.value)}
        className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm"
      >
        <option value="">{t("allActions")}</option>
        {ACTION_TYPE_KEYS.map((item) => (
          <option key={item.key} value={item.value}>
            {t("actionTypes." + item.key)}
          </option>
        ))}
      </select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          <X className="mr-1 size-4" />
          {t("clearAll")}
        </Button>
      )}
    </div>
  );
}
