import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { UserFormData } from "@/types/user";

async function apiRequest(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  return res.json();
}

export function useUserActions() {
  const queryClient = useQueryClient();
  const t = useTranslations("toast.users");

  const addUserMutation = useMutation({
    mutationFn: (data: UserFormData) =>
      apiRequest("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("addSuccess"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("addError"));
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserFormData }) =>
      apiRequest(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("updateSuccess"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("updateError"));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/api/users/${userId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("deleteSuccess"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("deleteError"));
    },
  });

  const lockUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/api/users/${userId}/lock`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("lockSuccess"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("lockError"));
    },
  });

  const unlockUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/api/users/${userId}/lock`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("unlockSuccess"));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("unlockError"));
    },
  });

  return {
    addUser: addUserMutation.mutateAsync,
    updateUser: (userId: string, data: UserFormData) =>
      updateUserMutation.mutateAsync({ userId, data }),
    deleteUser: deleteUserMutation.mutateAsync,
    lockUser: lockUserMutation.mutateAsync,
    unlockUser: unlockUserMutation.mutateAsync,
    isLoading:
      addUserMutation.isPending ||
      updateUserMutation.isPending ||
      deleteUserMutation.isPending ||
      lockUserMutation.isPending ||
      unlockUserMutation.isPending,
  };
}
