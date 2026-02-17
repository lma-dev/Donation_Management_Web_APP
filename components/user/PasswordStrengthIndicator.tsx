"use client";

import { CircleCheck, Circle } from "lucide-react";
import {
  validatePassword,
  PASSWORD_RULES,
} from "@/features/user-management/password-rules";

type PasswordStrengthIndicatorProps = {
  password: string;
};

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password);

  return (
    <ul className="grid gap-1.5 text-xs">
      {PASSWORD_RULES.map((rule) => {
        const passed = validation[rule.key];
        return (
          <li key={rule.key} className="flex items-center gap-1.5">
            {passed ? (
              <CircleCheck className="size-3.5 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="text-muted-foreground size-3.5 shrink-0" />
            )}
            <span
              className={
                passed
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }
            >
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
