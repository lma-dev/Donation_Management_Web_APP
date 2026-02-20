"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Loader2,
} from "lucide-react";

type MonthlyExportDropdownProps = {
  onExport: (type: "excel" | "pdf" | "json") => void;
  isExporting: boolean;
};

export function MonthlyExportDropdown({
  onExport,
  isExporting,
}: MonthlyExportDropdownProps) {
  const t = useTranslations("common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting} className="gap-2">
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {t("export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onExport("excel")}>
          <FileSpreadsheet className="size-4" />
          {t("exportExcel")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("pdf")}>
          <FileText className="size-4" />
          {t("exportPdf")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("json")}>
          <FileJson className="size-4" />
          {t("exportJson")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
