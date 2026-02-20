"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";

const MONTH_KEYS = [
  "",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

type CreateMonthlyFormProps = {
  year: number;
  month: number;
  previousBalance: string;
  onSubmit: (data: { exchangeRate: number; carryOver: number }) => Promise<void>;
};

export function CreateMonthlyForm({
  year,
  month,
  previousBalance,
  onSubmit,
}: CreateMonthlyFormProps) {
  const t = useTranslations("monthlyOverview");
  const tm = useTranslations("months");
  const [exchangeRate, setExchangeRate] = useState("");
  const [carryOver, setCarryOver] = useState(previousBalance !== "0" ? previousBalance : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rate = Number(exchangeRate);
    const carry = Number(carryOver) || 0;
    if (rate <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ exchangeRate: rate, carryOver: carry });
    } finally {
      setIsSubmitting(false);
    }
  }

  const prevBalanceNum = Number(previousBalance);

  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {t("createTitle", { month: tm(MONTH_KEYS[month]), year })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exchange-rate">{t("exchangeRateLabel")}</Label>
              <Input
                id="exchange-rate"
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder={t("exchangeRatePlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carry-over">{t("carryOverLabel")}</Label>
              <Input
                id="carry-over"
                type="number"
                step="1"
                value={carryOver}
                onChange={(e) => setCarryOver(e.target.value)}
                placeholder="0"
              />
              {prevBalanceNum > 0 && (
                <p className="text-muted-foreground text-xs">
                  {t("previousBalance", { amount: prevBalanceNum.toLocaleString() })}
                </p>
              )}
            </div>
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
              {t("createOverview")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
