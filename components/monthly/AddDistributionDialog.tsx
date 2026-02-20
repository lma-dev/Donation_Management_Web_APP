"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import type { DonationPlace } from "@/features/donation-place/types";

type AddDistributionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    recipient: string;
    donationPlaceId: string;
    amountMMK: number;
    remarks?: string;
  }) => Promise<void>;
};

export function AddDistributionDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddDistributionDialogProps) {
  const t = useTranslations("monthlyOverview.distribution");
  const tc = useTranslations("common");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [amountMMK, setAmountMMK] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: places = [] } = useQuery<DonationPlace[]>({
    queryKey: ["donation-places", "active"],
    queryFn: async () => {
      const res = await fetch("/api/donation-places?active=true");
      if (!res.ok) throw new Error("Failed to fetch donation places");
      return res.json();
    },
    enabled: open,
  });

  const numericAmount = Number(amountMMK) || 0;

  function reset() {
    setSelectedPlaceId("");
    setSelectedPlaceName("");
    setAmountMMK("");
    setRemarks("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlaceId || numericAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        recipient: selectedPlaceName,
        donationPlaceId: selectedPlaceId,
        amountMMK: numericAmount,
        remarks: remarks.trim() || undefined,
      });
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("dialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("donationPlace")}</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedPlaceName || t("selectPlace")}
                  <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder={t("searchPlaces")} />
                  <CommandList>
                    <CommandEmpty>{t("noPlaceFound")}</CommandEmpty>
                    <CommandGroup>
                      {places.map((place) => (
                        <CommandItem
                          key={place.id}
                          value={place.name}
                          onSelect={() => {
                            setSelectedPlaceId(place.id);
                            setSelectedPlaceName(place.name);
                            setComboboxOpen(false);
                          }}
                        >
                          {place.name}
                          {selectedPlaceId === place.id && (
                            <Check className="ml-auto size-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dist-amount">{t("amountMmk")}</Label>
            <Input
              id="dist-amount"
              type="number"
              value={amountMMK}
              onChange={(e) => setAmountMMK(e.target.value)}
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dist-remarks">{t("remarksOptional")}</Label>
            <Input
              id="dist-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={t("remarksPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tc("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !selectedPlaceId || numericAmount <= 0
              }
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {t("addDistribution")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
