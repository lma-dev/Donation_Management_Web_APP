"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Wallet } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
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
import { PasswordStrengthIndicator } from "@/components/user/PasswordStrengthIndicator";
import { resetPasswordSchema } from "@/features/auth/schema";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const tToast = useTranslations("toast.auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Spring Liberation Rose
          </h1>
        </div>
        <Card className="w-full max-w-105 shadow-sm">
          <CardContent className="pt-6">
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {t("invalidToken")}
            </div>
            <Link
              href="/auth/login"
              className="mt-4 flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t("backToLogin")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = resetPasswordSchema.safeParse({
      token,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? t("validationError");
      setError(firstError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (body.code === "TOKEN_EXPIRED") {
          setError(t("tokenExpired"));
        } else if (body.code === "TOKEN_INVALID") {
          setError(t("invalidToken"));
        } else {
          setError(body.error ?? t("error"));
        }
        setIsLoading(false);
        return;
      }

      toast.success(tToast("resetPasswordSuccess"));
      router.push("/auth/login");
    } catch {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  }

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("newPassword")}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("newPasswordPlaceholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {newPassword && <PasswordStrengthIndicator password={newPassword} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordsMatch && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {t("passwordsMatch")}
                </p>
              )}
              {passwordsMismatch && (
                <p className="text-xs text-destructive">
                  {t("passwordsMismatch")}
                </p>
              )}
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
              className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t("backToLogin")}
            </Link>
          </form>
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
