"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { Auth } from "@/Schema/Auth";

type Props = {
  register: UseFormRegister<Auth>;
  errors: FieldErrors<Auth>;
};

export function OtpField({ register, errors }: Props) {
  return (
    <div>
      <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">
        Verification Code
      </label>
      <Input
        {...register("otp")}
        id="otp"
        placeholder="Enter 6-digit code"
        maxLength={6}
        autoComplete="one-time-code"
        className="w-full text-center tracking-[0.5em] font-[family-name:var(--font-space-mono)] text-lg"
      />
      {errors.otp && (
        <p className="text-[rgb(var(--destructive))] text-xs mt-2">{errors.otp.message}</p>
      )}
    </div>
  );
}
