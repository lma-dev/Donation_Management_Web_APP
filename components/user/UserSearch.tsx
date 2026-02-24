"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type UserSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function UserSearch({ value, onChange }: UserSearchProps) {
  const t = useTranslations("userManagement");

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
