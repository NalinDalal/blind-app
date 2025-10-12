// components/auth/EmailField.tsx
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Auth } from "@/Schema/Auth";

type Props = {
    register: UseFormRegister<Auth>;
    errors: FieldErrors<Auth>;
};

/**
 * Render an email input bound to react-hook-form and display its validation message when present.
 *
 * @param register - react-hook-form register function wired to the "email" field
 * @param errors - validation errors object for the Auth form; used to show the email error message
 * @returns A JSX element containing the email input and an optional validation message
 */
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