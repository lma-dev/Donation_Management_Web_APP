import { useMutation, useQueryClient } from "@tanstack/react-query";

async function apiRequest(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  return res.json();
}

export type DonationPlaceFormData = {
  name: string;
  note?: string;
  isActive?: boolean;
};

export function useDonationPlaceActions() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data: DonationPlaceFormData) =>
      apiRequest("/api/donation-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["donation-places"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: DonationPlaceFormData;
    }) =>
      apiRequest(`/api/donation-places/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["donation-places"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/donation-places/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["donation-places"] }),
  });

  return {
    addPlace: addMutation.mutateAsync,
    updatePlace: (id: string, data: DonationPlaceFormData) =>
      updateMutation.mutateAsync({ id, data }),
    deletePlace: deleteMutation.mutateAsync,
    isLoading:
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
