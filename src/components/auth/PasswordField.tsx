// components/auth/PasswordField.tsx
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Auth } from "@/Schema/Auth";

type Props = {
    register: UseFormRegister<Auth>;
    errors: FieldErrors<Auth>;
    mode: "register" | "login";
};

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