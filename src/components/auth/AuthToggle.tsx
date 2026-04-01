"use client";

import type { AuthMode } from "./AuthForm";

type AuthToggleProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthToggle({ mode, onModeChange }: AuthToggleProps) {
  const options: { value: AuthMode; label: string }[] = [
    { value: "register", label: "Register" },
    { value: "login", label: "Sign In" },
    { value: "otp", label: "OTP" },
  ];

  return (
    <div className="flex gap-1 p-1 bg-surface rounded-xl mb-6">
      {options.map(({ value, label }) => {
        const isActive = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onModeChange(value)}
            className={`
              flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? "bg-[rgb(var(--accent))] text-foreground shadow-lg"
                : "text-muted hover:text-foreground hover:bg-surface-elevated"
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
