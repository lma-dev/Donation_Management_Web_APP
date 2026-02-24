"use client";

import { useState, useEffect } from "react";
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
import type { SupporterDonationResponse } from "@/features/monthly-overview/types";

type UserOption = {
  id: string;
  name: string | null;
  email: string;
};

type AddSupporterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exchangeRate: number;
  editData?: SupporterDonationResponse | null;
  onSubmit: (data: {
    name: string;
    amount: number;
    currency: string;
    kyatAmount: number;
  }) => Promise<void>;
  onUpdate?: (data: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    kyatAmount: number;
  }) => Promise<void>;
};

export function AddSupporterDialog({
  open,
  onOpenChange,
  exchangeRate,
  editData,
  onSubmit,
  onUpdate,
}: AddSupporterDialogProps) {
  const t = useTranslations("monthlyOverview.supporters");
  const tc = useTranslations("common");
  const [selectedName, setSelectedName] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"JPY" | "MMK">("JPY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!editData;

  const { data: users = [] } = useQuery<UserOption[]>({
    queryKey: ["users-list"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: open,
  });

  useEffect(() => {
    if (editData) {
      setSelectedName(editData.name);
      setAmount(editData.amount);
      setCurrency(editData.currency as "JPY" | "MMK");
    } else {
      setSelectedName("");
      setAmount("");
      setCurrency("JPY");
    }
  }, [editData]);

  const numericAmount = Number(amount) || 0;
  const kyatPreview =
    currency === "JPY"
      ? Math.round(numericAmount * exchangeRate)
      : numericAmount;

  function reset() {
    setSelectedName("");
    setAmount("");
    setCurrency("JPY");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedName.trim() || numericAmount <= 0) return;

    setError("");
    setIsSubmitting(true);
    try {
      if (isEditMode && onUpdate) {
        await onUpdate({
          id: editData.id,
          name: selectedName.trim(),
          amount: numericAmount,
          currency,
          kyatAmount: kyatPreview,
        });
      } else {
        await onSubmit({
          name: selectedName.trim(),
          amount: numericAmount,
          currency,
          kyatAmount: kyatPreview,
        });
      }
      reset();
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message || tc("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("editDialogTitle") : t("dialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t("editDialogDescription") : t("dialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label>{t("name")}</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedName || t("selectName")}
                  <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder={t("searchName")} />
                  <CommandList>
                    <CommandEmpty>{t("noUserFound")}</CommandEmpty>
                    <CommandGroup>
                      {users.map((user) => {
                        const displayName = user.name ?? user.email;
                        return (
                          <CommandItem
                            key={user.id}
                            value={displayName}
                            onSelect={() => {
                              setSelectedName(displayName);
                              setComboboxOpen(false);
                            }}
                          >
                            {displayName}
                            {selectedName === displayName && (
                              <Check className="ml-auto size-4" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supporter-amount">{t("amount")}</Label>
            <Input
              id="supporter-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t("currency")}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={currency === "JPY" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrency("JPY")}
              >
                JPY
              </Button>
              <Button
                type="button"
                variant={currency === "MMK" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrency("MMK")}
              >
                MMK
              </Button>
            </div>
          </div>
          <div className="bg-muted rounded-md p-3">
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>{t("kyatAmount")}</span>
              <span className="text-foreground text-lg font-semibold tabular-nums">
                {new Intl.NumberFormat("en-US").format(kyatPreview)}
              </span>
            </div>
            {currency === "JPY" && (
              <p className="text-muted-foreground mt-1 text-xs">
                {new Intl.NumberFormat("en-US").format(numericAmount)} JPY ×{" "}
                {exchangeRate} = {new Intl.NumberFormat("en-US").format(kyatPreview)}{" "}
                MMK
              </p>
            )}
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
              disabled={isSubmitting || !selectedName.trim() || numericAmount <= 0}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditMode ? t("updateDonation") : t("addDonation")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
