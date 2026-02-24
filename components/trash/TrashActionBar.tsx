"use client";

import { useTranslations } from "next-intl";
import { RotateCcw, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type TrashActionBarProps = {
  selectedCount: number;
  onRestore: () => void;
  onPurge: () => void;
  onClearSelection: () => void;
  isRestoring: boolean;
  isPurging: boolean;
  canPurge: boolean;
};

export function TrashActionBar({
  selectedCount,
  onRestore,
  onPurge,
  onClearSelection,
  isRestoring,
  isPurging,
  canPurge,
}: TrashActionBarProps) {
  const t = useTranslations("trash");

  if (selectedCount === 0) return null;

  return (
    <div className="bg-muted/50 flex flex-wrap items-center gap-2 rounded-lg border p-3">
      <span className="text-muted-foreground text-sm font-medium">
        {t("selected", { count: selectedCount })}
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRestore}
          disabled={isRestoring || isPurging}
        >
          {isRestoring ? (
            <Loader2 className="mr-1 size-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-1 size-4" />
          )}
          {t("restoreSelected")}
        </Button>

        {canPurge && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onPurge}
            disabled={isRestoring || isPurging}
          >
            {isPurging ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 size-4" />
            )}
            {t("purgeSelected")}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isRestoring || isPurging}
        >
          <X className="mr-1 size-4" />
          {t("clearSelection")}
        </Button>
      </div>
    </div>
  );
}
