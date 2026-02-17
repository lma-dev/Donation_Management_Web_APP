"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type DonationPlaceSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DonationPlaceSearch({
  value,
  onChange,
}: DonationPlaceSearchProps) {
  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        placeholder="Search donation places..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
