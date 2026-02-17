import { useMutation, useQueryClient } from "@tanstack/react-query";
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

  const addUserMutation = useMutation({
    mutationFn: (data: UserFormData) =>
      apiRequest("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserFormData }) =>
      apiRequest(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/api/users/${userId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return {
    addUser: addUserMutation.mutateAsync,
    updateUser: (userId: string, data: UserFormData) =>
      updateUserMutation.mutateAsync({ userId, data }),
    deleteUser: deleteUserMutation.mutateAsync,
    isLoading:
      addUserMutation.isPending ||
      updateUserMutation.isPending ||
      deleteUserMutation.isPending,
  };
}
