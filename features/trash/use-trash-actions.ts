import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { TrashResourceType } from "./types";

async function apiRequest(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  return res.json();
}

export function useTrashActions() {
  const queryClient = useQueryClient();
  const t = useTranslations("toast.trash");

  const restoreMutation = useMutation({
    mutationFn: ({ type, ids }: { type: TrashResourceType; ids: string[] }) =>
      apiRequest(`/api/trash/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: (_, { type, ids }) => {
      queryClient.invalidateQueries({ queryKey: ["trash", type] });
      toast.success(t("restoreSuccess", { count: ids.length }));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("restoreError"));
    },
  });

  const purgeMutation = useMutation({
    mutationFn: ({ type, ids }: { type: TrashResourceType; ids: string[] }) =>
      apiRequest(`/api/trash/${type}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: (_, { type, ids }) => {
      queryClient.invalidateQueries({ queryKey: ["trash", type] });
      toast.success(t("purgeSuccess", { count: ids.length }));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("purgeError"));
    },
  });

  return {
    restore: restoreMutation.mutateAsync,
    purge: purgeMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    isPurging: purgeMutation.isPending,
  };
}
