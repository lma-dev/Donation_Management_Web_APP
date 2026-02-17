"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type CreateMonthlyFormProps = {
  year: number;
  month: number;
  onSubmit: (data: { exchangeRate: number }) => Promise<void>;
};

export function CreateMonthlyForm({
  year,
  month,
  onSubmit,
}: CreateMonthlyFormProps) {
  const [exchangeRate, setExchangeRate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rate = Number(exchangeRate);
    if (rate <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ exchangeRate: rate });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            Create Monthly Overview — {MONTH_NAMES[month]} {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exchange-rate">Exchange Rate (JPY to MMK)</Label>
              <Input
                id="exchange-rate"
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="e.g. 32.5"
                required
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Carry over from the previous month will be calculated
              automatically.
            </p>
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isSubmitting || Number(exchangeRate) <= 0}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Create Overview
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
