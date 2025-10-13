// components/auth/OtpField.tsx
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Auth } from "@/Schema/Auth";

type Props = {
  register: UseFormRegister<Auth>;
  errors: FieldErrors<Auth>;
};

/**
 * Renders an OTP input field wired to react-hook-form and shows a validation message when present.
 *
 * @param register - react-hook-form `register` function for registering the `otp` field
 * @param errors - Validation errors for the auth form; if `errors.otp` exists its `message` is displayed
 * @returns The OTP input UI, including the input and any validation message
 */
export function OtpField({ register, errors }: Props) {
  return (
    <div>
      <Input
        {...register("otp")}
        placeholder="Enter 6-digit OTP"
        maxLength={6}
        autoComplete="one-time-code"
      />
      {errors.otp && (
        <p className="text-red-500 text-xs mt-2">{errors.otp.message}</p>
      )}
    </div>
  );
}
