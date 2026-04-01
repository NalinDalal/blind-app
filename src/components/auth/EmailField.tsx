"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { Auth } from "@/Schema/Auth";

type Props = {
  register: UseFormRegister<Auth>;
  errors: FieldErrors<Auth>;
};

export function EmailField({ register, errors }: Props) {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
        Email Address
      </label>
      <Input
        {...register("email")}
        id="email"
        placeholder="college-email@oriental.ac.in"
        autoComplete="email"
        className="w-full"
      />
      {errors.email && (
        <p className="text-[rgb(var(--destructive))] text-xs mt-2">{errors.email.message}</p>
      )}
    </div>
  );
}
