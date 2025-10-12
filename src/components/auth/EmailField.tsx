// components/auth/EmailField.tsx
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Auth } from "@/Schema/Auth";

type Props = {
    register: UseFormRegister<Auth>;
    errors: FieldErrors<Auth>;
};

export function EmailField({ register, errors }: Props) {
    return (
        <div>
            <Input
                {...register("email")}
                placeholder="college-email@oriental.ac.in"
                autoComplete="email"
            />
            {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
        </div>
    );
}