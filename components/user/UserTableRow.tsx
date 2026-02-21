"use client";

import { useTranslations } from "next-intl";
import { Pencil, Trash2, Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { User } from "@/types/user";

type UserTableRowProps = {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onLock?: (user: User) => void;
  onUnlock?: (user: User) => void;
  showRoleColumn: boolean;
};

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function UserTableRow({
  user,
  onEdit,
  onDelete,
  onLock,
  onUnlock,
  showRoleColumn,
}: UserTableRowProps) {
  const t = useTranslations("userManagement");
  const tc = useTranslations("common");

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell className="text-muted-foreground">
        {user.email || "—"}
      </TableCell>
      {showRoleColumn && (
        <TableCell>
          <Badge variant="outline" className="text-xs font-normal">
            {user.role}
          </Badge>
        </TableCell>
      )}
      <TableCell>
        {user.isLocked ? (
          <Badge variant="destructive" className="text-xs font-normal">
            {t("table.locked")}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs font-normal">
            {t("table.active")}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onEdit(user)}
              >
                <Pencil />
                <span className="sr-only">{`${tc("edit")} ${user.name}`}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tc("edit")}</TooltipContent>
          </Tooltip>
          {user.isLocked ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-emerald-600 hover:text-emerald-600"
                  onClick={() => onUnlock?.(user)}
                >
                  <LockOpen />
                  <span className="sr-only">{`${tc("unlock")} ${user.name}`}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tc("unlock")}</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-amber-600 hover:text-amber-600"
                  onClick={() => onLock?.(user)}
                >
                  <Lock />
                  <span className="sr-only">{`${tc("lock")} ${user.name}`}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tc("lock")}</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(user)}
              >
                <Trash2 />
                <span className="sr-only">{`${tc("delete")} ${user.name}`}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tc("delete")}</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
