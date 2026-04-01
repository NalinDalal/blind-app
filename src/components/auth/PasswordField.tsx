"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Auth } from "@/Schema/Auth";

type Props = {
  register: UseFormRegister<Auth>;
  errors: FieldErrors<Auth>;
  mode: "register" | "login";
};

export function PasswordField({ register, errors, mode }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
        Password
      </label>
      <div className="relative">
        <Input
          {...register("password")}
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className="w-full pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {errors.password && (
        <p className="text-[rgb(var(--destructive))] text-xs mt-2">{errors.password.message}</p>
      )}
    </div>
  );
}
