"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, ChevronDown } from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

type MonthSelectorProps = {
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
};

export function MonthSelector({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarDays className="size-4" />
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
          {YEARS.map((year) =>
            MONTH_NAMES.map((name, i) => (
              <DropdownMenuItem
                key={`${year}-${i}`}
                onClick={() => {
                  onYearChange(year);
                  onMonthChange(i + 1);
                }}
                className={
                  year === selectedYear && i + 1 === selectedMonth
                    ? "bg-accent"
                    : ""
                }
              >
                {name} {year}
              </DropdownMenuItem>
            )),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
