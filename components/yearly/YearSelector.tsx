"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarRange, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

type YearSelectorProps = {
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
};

export function YearSelector({
  selectedYear,
  availableYears,
  onYearChange,
}: YearSelectorProps) {
  const t = useTranslations("yearlyOverview");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarRange className="size-4" />
          {t("fy", { year: selectedYear })}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableYears.map((year) => (
          <DropdownMenuItem key={year} onClick={() => onYearChange(year)}>
            {t("fy", { year })}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
