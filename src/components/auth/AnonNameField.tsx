// components/auth/AnonNameField.tsx
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Auth } from "@/Schema/Auth";

type Props = {
    register: UseFormRegister<Auth>;
    errors: FieldErrors<Auth>;
};

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