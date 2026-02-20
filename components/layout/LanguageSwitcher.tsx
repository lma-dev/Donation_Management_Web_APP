"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const t = useTranslations("settings.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(newLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", isPending && "pointer-events-none opacity-60")}
        >
          <Languages className="size-4" />
          {t(locale as "en" | "ja" | "mm")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={loc === locale ? "bg-accent" : ""}
          >
            {t(loc as "en" | "ja" | "mm")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
