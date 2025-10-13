// components/auth/PasswordField.tsx

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { Auth } from "@/Schema/Auth";

type Props = {
  register: UseFormRegister<Auth>;
  errors: FieldErrors<Auth>;
  mode: "register" | "login";
};

/**
 * Renders a password input field wired to react-hook-form with mode-specific autocomplete and an inline validation message.
 *
 * @param register - react-hook-form `register` function bound to the auth form schema for registering the `password` field
 * @param errors - form field errors for the auth form; `errors.password` message is shown when present
 * @param mode - either `"register"` or `"login"`; selects the input's `autoComplete` value (`"new-password"` vs `"current-password"`)
 * @returns A JSX element containing the password input and an optional error message
 */
export function PasswordField({ register, errors, mode }: Props) {
  return (
    <div>
      <Input
        {...register("password")}
        type="password"
        placeholder="Password"
        autoComplete={mode === "register" ? "new-password" : "current-password"}
      />
      {errors.password && (
        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
      )}
    </div>
  );
}
