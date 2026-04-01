"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { Auth } from "@/Schema/Auth";

type Props = {
  register: UseFormRegister<Auth>;
  errors: FieldErrors<Auth>;
};

export function AnonNameField({ register, errors }: Props) {
  return (
    <div>
      <label htmlFor="anonName" className="block text-sm font-medium text-foreground mb-2">
        Choose Your Anonymous Identity
      </label>
      <Input
        {...register("anonName")}
        id="anonName"
        placeholder="e.g. Shadow_Phoenix_42"
        className="w-full"
      />
      {errors.anonName && (
        <p className="text-[rgb(var(--destructive))] text-xs mt-2">{errors.anonName.message}</p>
      )}
      <p className="text-xs text-muted mt-2">
        This name will appear on your posts. Choose wisely - it cannot be changed.
      </p>
    </div>
  );
}
