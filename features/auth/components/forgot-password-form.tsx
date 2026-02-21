"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, Mail, Wallet } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/features/auth/schema";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(t("invalidEmail"));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }

      setIsSubmitted(true);
    } catch {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Wallet className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          Spring Liberation Rose
        </h1>
      </div>

      <Card className="w-full max-w-105 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 rounded-lg bg-emerald-50 px-4 py-6 dark:bg-emerald-950/30">
                <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <p className="text-center text-sm text-emerald-700 dark:text-emerald-300">
                  {t("successMessage")}
                </p>
              </div>
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("submitting")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("backToLogin")}
              </Link>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span>System operational · v1.0.0</span>
      </div>
    </div>
  );
}
