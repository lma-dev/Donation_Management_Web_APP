"use client";

import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
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

export function UserTableRow({ user, onEdit, onDelete }: UserTableRowProps) {
  const tc = useTranslations("common");

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell className="text-muted-foreground">
        {user.email || "—"}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs font-normal">
          {user.role}
        </Badge>
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
