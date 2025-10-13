// components/auth/AnonNameField.tsx

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { Auth } from "@/Schema/Auth";

type Props = {
  register: UseFormRegister<Auth>;
  errors: FieldErrors<Auth>;
};

/**
 * Render an input bound to the `anonName` form field and display its validation error.
 *
 * @param register - react-hook-form `register` function used to wire the `anonName` input
 * @param errors - validation errors object for the auth form; `errors.anonName?.message` is shown when present
 * @returns The JSX element containing the anonName input and an inline error message when applicable
 */
export function AnonNameField({ register, errors }: Props) {
  return (
    <div>
      <Input
        {...register("anonName")}
        placeholder="Choose your anonymous name"
      />
      {errors.anonName && (
        <p className="text-red-500 text-xs mt-1">{errors.anonName.message}</p>
      )}
    </div>
  );
}
