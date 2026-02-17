"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ACTION_TYPES = [
  "Added",
  "Updated",
  "Deleted",
  "Login",
  "Login Failed",
  "Changed Password",
  "Export",
  "System",
];

type ActivityLogFiltersProps = {
  dateFrom: string;
  dateTo: string;
  actionType: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onActionTypeChange: (value: string) => void;
  onClearAll: () => void;
};

export function ActivityLogFilters({
  dateFrom,
  dateTo,
  actionType,
  onDateFromChange,
  onDateToChange,
  onActionTypeChange,
  onClearAll,
}: ActivityLogFiltersProps) {
  const hasFilters = dateFrom || dateTo || actionType;

  return (
    <div className="flex flex-wrap items-center gap-2">
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
        <option value="">All Actions</option>
        {ACTION_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          <X className="mr-1 size-4" />
          Clear All
        </Button>
      )}
    </div>
  );
}
