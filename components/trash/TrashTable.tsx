"use client";

import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type TrashColumn<T> = {
  key: string;
  labelKey: string;
  render: (item: T) => React.ReactNode;
};

type TrashTableProps<T extends { id: string }> = {
  items: T[];
  columns: TrashColumn<T>[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
};

export function TrashTable<T extends { id: string }>({
  items,
  columns,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: TrashTableProps<T>) {
  const t = useTranslations("trash");

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Trash2 className="text-muted-foreground mb-3 size-10" />
        <p className="text-muted-foreground text-sm font-medium">
          {t("empty")}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {t("emptyDescription")}
        </p>
      </div>
    );
  }

  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const someSelected = items.some((item) => selectedIds.has(item.id)) && !allSelected;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={onToggleSelectAll}
              aria-label="Select all"
            />
          </TableHead>
          {columns.map((col) => (
            <TableHead key={col.key}>{t(`table.${col.labelKey}`)}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} data-state={selectedIds.has(item.id) ? "selected" : undefined}>
            <TableCell>
              <Checkbox
                checked={selectedIds.has(item.id)}
                onCheckedChange={() => onToggleSelect(item.id)}
                aria-label={`Select ${item.id}`}
              />
            </TableCell>
            {columns.map((col) => (
              <TableCell key={col.key}>{col.render(item)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
