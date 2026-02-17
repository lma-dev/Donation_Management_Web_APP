"use client";

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

type ExportDropdownProps = {
  onExport: (type: "excel" | "pdf" | "json") => void;
  isExporting: boolean;
};

export function ExportDropdown({ onExport, isExporting }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting} className="gap-2">
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onExport("excel")}>
          <FileSpreadsheet className="size-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("pdf")}>
          <FileText className="size-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("json")}>
          <FileJson className="size-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
