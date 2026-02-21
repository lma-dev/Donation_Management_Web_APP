"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserTableRow } from "@/components/user/UserTableRow";
import type { User } from "@/types/user";

type UserTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onLock?: (user: User) => void;
  onUnlock?: (user: User) => void;
  showRoleColumn: boolean;
};

function EmptyState() {
  const t = useTranslations("userManagement");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-lg">
        <Users className="text-muted-foreground size-6" />
      </div>
      <h3 className="text-sm font-medium">{t("empty")}</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        {t("emptyDescription")}
      </p>
    </div>
  );
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  onLock,
  onUnlock,
  showRoleColumn,
}: UserTableProps) {
  const t = useTranslations("userManagement");

  if (users.length === 0) {
    return <EmptyState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>{t("table.name")}</TableHead>
          <TableHead>{t("table.email")}</TableHead>
          {showRoleColumn && <TableHead>{t("table.role")}</TableHead>}
          <TableHead>{t("table.status")}</TableHead>
          <TableHead>{t("table.memberSince")}</TableHead>
          <TableHead className="w-30">{t("table.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserTableRow
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            onLock={onLock}
            onUnlock={onUnlock}
            showRoleColumn={showRoleColumn}
          />
        ))}
      </TableBody>
    </Table>
  );
}
