"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { PasswordStrengthIndicator } from "@/components/user/PasswordStrengthIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User, UserFormData } from "@/types/user";

type UserFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (data: UserFormData) => void | Promise<void>;
};

function formatDateReadonly(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function UserForm({ open, onOpenChange, user, onSubmit }: UserFormProps) {
  const isEditing = user !== null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(user?.name ?? "");
      setEmail(user?.email ?? "");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError(null);
      setSubmitting(false);
    }
  }, [open, user]);

  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;
  const passwordTouched = password.length > 0;
  const confirmTouched = confirmPassword.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name, email, password, confirmPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Update User" : "Register User"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the user details below."
              : "Fill in the details to register a new user."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="user-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="user-name"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="user-email"
              type="email"
              placeholder="user@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {isEditing && user && (
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Member Since</Label>
              <p className="text-sm">{formatDateReadonly(user.createdAt)}</p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="user-password">
              Password{" "}
              {!isEditing && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
              <Input
                id="user-password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  isEditing ? "Leave blank to keep current" : "Enter password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEditing}
                className="pr-9"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute top-1/2 right-2 -translate-y-1/2"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {passwordTouched && <PasswordStrengthIndicator password={password} />}
          </div>

          {passwordTouched && (
            <div className="grid gap-2">
              <Label htmlFor="user-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="user-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-9"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {confirmTouched && (
                <div className="flex items-center gap-1.5 text-xs">
                  {passwordsMatch ? (
                    <>
                      <CircleCheck className="size-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="text-destructive size-3.5" />
                      <span className="text-destructive">
                        Passwords do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <CircleAlert className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
