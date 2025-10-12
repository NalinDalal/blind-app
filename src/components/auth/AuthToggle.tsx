// components/auth/AuthToggle.tsx
import { Button } from "@/components/ui/button";
import { AuthMode } from "./AuthForm"; // We'll define AuthMode in AuthForm

type AuthToggleProps = {
    mode: AuthMode;
    onModeChange: (mode: AuthMode) => void;
};

/**
 * Renders a three-button authentication mode toggle (Register, Login, OTP) and highlights the active mode.
 *
 * @param mode - Current authentication mode: `"register"`, `"login"`, or `"otp"`.
 * @param onModeChange - Callback invoked with the selected `AuthMode` when a button is clicked.
 * @returns A JSX element containing three buttons for switching authentication modes.
 */
export function AuthToggle({ mode, onModeChange }: AuthToggleProps) {
    return (
        <div className="flex justify-center gap-2 mb-6">
            <Button
                variant={mode === "register" ? "default" : "outline"}
                onClick={() => onModeChange("register")}
            >
                Register
            </Button>
            <Button
                variant={mode === "login" ? "default" : "outline"}
                onClick={() => onModeChange("login")}
            >
                Login
            </Button>
            <Button
                variant={mode === "otp" ? "default" : "outline"}
                onClick={() => onModeChange("otp")}
            >
                OTP
            </Button>
        </div>
    );
}