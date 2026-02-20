"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageContent } from "@/components/layout/PageContent";
import { UserSearch } from "@/components/user/UserSearch";
import { UserTable } from "@/components/user/UserTable";
import { UserForm } from "@/components/user/UserForm";
import { DeleteUserDialog } from "@/components/user/DeleteUserDialog";
import {
  searchAtom,
  pageAtom,
  PAGE_SIZE,
} from "@/features/user-management/atoms";
import { useUserActions } from "@/features/user-management/use-user-actions";
import type { User, UserFormData } from "@/types/user";

export default function UserManagementPage() {
  const t = useTranslations("userManagement");
  const tc = useTranslations("common");
  // Fetch users from API
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      return data.map((u: Record<string, unknown>) => ({
        ...u,
        createdAt: new Date(u.createdAt as string),
        updatedAt: new Date(u.updatedAt as string),
      }));
    },
  });

  // Client-side search & pagination state
  const [search, setSearch] = useAtom(searchAtom);
  const [page, setPage] = useAtom(pageAtom);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Actions
  const { addUser, updateUser, deleteUser } = useUserActions();

  // Local dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  function handleRegister() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function handleDeleteRequest(user: User) {
    setDeletingUser(user);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(data: UserFormData) {
    if (editingUser) {
      await updateUser(editingUser.id, data);
    } else {
      await addUser(data);
    }
    setFormOpen(false);
  }

  async function handleDeleteConfirm() {
    if (deletingUser) {
      await deleteUser(deletingUser.id);
    }
    setDeleteOpen(false);
    setDeletingUser(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  return (
    <PageContent
      title={t("title")}
      description={t("description")}
      actions={
        <Button onClick={handleRegister} className="w-full sm:w-auto">
          <Plus />
          {t("registerUser")}
        </Button>
      }
    >
      {/* Search */}
      <UserSearch value={search} onChange={setSearch} />

      {/* Table Card */}
      <Card className="gap-0 py-0">
        {/* Table */}
        <CardContent className="p-0">
          <UserTable
            users={paginated}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        </CardContent>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
            <p className="text-muted-foreground text-sm">
              {tc("showing", {
                from: (currentPage - 1) * PAGE_SIZE + 1,
                to: Math.min(currentPage * PAGE_SIZE, filtered.length),
                total: filtered.length,
                item: "users",
              })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft />
                <span className="sr-only">{tc("previousPage")}</span>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight />
                <span className="sr-only">{tc("nextPage")}</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* User Form Dialog (Create / Edit) */}
      <UserForm
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={deletingUser}
        onConfirm={handleDeleteConfirm}
      />
    </PageContent>
  );
}
