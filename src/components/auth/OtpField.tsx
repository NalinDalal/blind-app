// components/auth/OtpField.tsx
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Auth } from "@/Schema/Auth";

type Props = {
    register: UseFormRegister<Auth>;
    errors: FieldErrors<Auth>;
};

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