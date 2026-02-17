"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type AddSupporterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exchangeRate: number;
  onSubmit: (data: {
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
  onSubmit,
}: AddSupporterDialogProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "";
  const [name, setName] = useState(userName);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"JPY" | "MMK">("JPY");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userName) setName(userName);
  }, [userName]);

  const numericAmount = Number(amount) || 0;
  const kyatPreview =
    currency === "JPY"
      ? Math.round(numericAmount * exchangeRate)
      : numericAmount;

  function reset() {
    setName(userName);
    setAmount("");
    setCurrency("JPY");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || numericAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        amount: numericAmount,
        currency,
        kyatAmount: kyatPreview,
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
          <DialogTitle>Add Supporter Donation</DialogTitle>
          <DialogDescription>
            Add a new donation entry from a supporter.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supporter-name">Name</Label>
            <Input
              id="supporter-name"
              value={name}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supporter-amount">Amount</Label>
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
            <Label>Currency</Label>
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
              <span>Kyat Amount (MMK)</span>
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || numericAmount <= 0}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Add Donation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
