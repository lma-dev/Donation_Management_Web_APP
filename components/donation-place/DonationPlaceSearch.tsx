"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

type DonationPlaceSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DonationPlaceSearch({
  value,
  onChange,
}: DonationPlaceSearchProps) {
  const t = useTranslations("donationPlaces");

  return (
    <div className="relative max-w-sm">
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        placeholder={t("searchPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
