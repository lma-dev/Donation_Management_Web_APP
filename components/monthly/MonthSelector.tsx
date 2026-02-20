"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, ChevronDown } from "lucide-react";
import { MONTH_KEYS } from "@/lib/constants";

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
  const tm = useTranslations("months");

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarDays className="size-4" />
            {selectedYear}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {YEARS.map((year) => (
            <DropdownMenuItem
              key={year}
              onClick={() => onYearChange(year)}
              className={year === selectedYear ? "bg-accent" : ""}
            >
              {year}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            {tm(MONTH_KEYS[selectedMonth - 1])}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {MONTH_KEYS.map((key, i) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onMonthChange(i + 1)}
              className={i + 1 === selectedMonth ? "bg-accent" : ""}
            >
              {tm(key)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
