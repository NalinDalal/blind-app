// components/auth/AuthToggle.tsx
import { Button } from "@/components/ui/button";
import { AuthMode } from "./AuthForm"; // We'll define AuthMode in AuthForm

type AuthToggleProps = {
    mode: AuthMode;
    onModeChange: (mode: AuthMode) => void;
};

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