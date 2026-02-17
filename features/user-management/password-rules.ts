export type PasswordValidation = {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
};

export const PASSWORD_RULES = [
  { key: "minLength" as const, label: "At least 8 characters" },
  { key: "hasUppercase" as const, label: "One uppercase letter" },
  { key: "hasLowercase" as const, label: "One lowercase letter" },
  { key: "hasNumber" as const, label: "One number" },
  { key: "hasSpecialChar" as const, label: "One special character" },
];

export function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
}
