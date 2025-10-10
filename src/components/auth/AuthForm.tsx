// components/auth/AuthForm.tsx
"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Loader2} from "lucide-react";
import {useForm} from "react-hook-form";
import toast from "react-hot-toast";
import {Button} from "@/components/ui/button";
import {useAppDispatch, useAppSelector} from "@/redux/hooks";
import {
    login,
    register as registerUser,
    requestOtp,
    requestOtpEmailVerification,
    setAnonName,
    verifyEmailOtp,
    verifyOtp,
} from "@/redux/slices/AuthSlice";
import {Auth, AuthSchema} from "@/Schema/Auth";
import {AuthMessageType} from "@/redux/types";
import {AuthToggle} from "./AuthToggle";
import {EmailField} from "./EmailField";
import {PasswordField} from "./PasswordField";
import {OtpField} from "./OtpField";
import {AnonNameField} from "./AnonNameField";
import {useState} from "react"; // <-- IMPORT useState

export type AuthMode = "register" | "login" | "otp" | "anon" | "verifyEmail";

type AuthFormProps = {
    mode: AuthMode;
    onModeChange: (mode: AuthMode) => void;
};

export function AuthForm({mode, onModeChange}: AuthFormProps) {
    const dispatch = useAppDispatch();
    const {status, message, email: authEmail} = useAppSelector(
        (state) => state.auth
    );

    // --- ADDED: State for resend button loading ---
    const [isResending, setIsResending] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors},
        watch,
    } = useForm<Auth>({
        resolver: zodResolver(AuthSchema),
        defaultValues: {mode, email: authEmail ?? "", password: "", otp: "", anonName: ""},
    });

    const otpValue = watch("otp");
    const isLoading = status === "loading";

    // --- ADDED: Handler for resending OTP ---
    const handleResendOtp = async () => {
        if (!authEmail) {
            toast.error("Email address not found to resend OTP.");
            return;
        }
        setIsResending(true);
        try {
            await dispatch(requestOtpEmailVerification({email: authEmail})).unwrap();
            toast.success("A new OTP has been sent.");
        } catch (error) {
            // Error toast is handled by the slice's `handleFailure` reducer
        } finally {
            setIsResending(false);
        }
    };


    const onSubmit = async (data: Auth) => {
        try {
            switch (mode) {
                case "register":
                    await dispatch(
                        registerUser({email: data.email || "", password: data.password!})
                    ).unwrap();
                    break;

                case "login":
                    await dispatch(
                        login({email: data.email || "", password: data.password!})
                    ).unwrap();
                    break;

                case "verifyEmail":
                    await dispatch(
                        verifyEmailOtp({email: authEmail!, otp: data.otp!})
                    ).unwrap();
                    break;

                case "otp":
                    if (data.otp) {
                        await dispatch(verifyOtp({email: data.email || "", otp: data.otp})).unwrap();
                    } else {
                        await dispatch(requestOtp({email: data.email || ""})).unwrap();
                        toast.success("OTP for login sent to your email!");
                    }
                    break;

                case "anon":
                    await dispatch(setAnonName({anonName: data.anonName!})).unwrap();
                    break;
            }
        } catch (error) {
            console.error("Authentication action failed:", error);
        }
    };

    const getButtonText = () => {
        if (isLoading) return "Processing...";
        const texts: Record<AuthMode, string> = {
            register: "Create Account",
            login: "Sign In",
            otp: otpValue ? "Verify OTP & Login" : "Send Login OTP",
            verifyEmail: "Verify Your Email",
            anon: "Set Anonymous Name & Finish",
        };
        return texts[mode];
    };

    return (
        <>
            {mode !== "anon" && mode !== "verifyEmail" && (
                <AuthToggle mode={mode} onModeChange={onModeChange}/>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {(mode === "login" || mode === "register" || mode === "otp") && (
                    <EmailField register={register} errors={errors}/>
                )}

                {(mode === "login" || mode === "register") && (
                    <PasswordField register={register} errors={errors} mode={mode}/>
                )}

                {(mode === "otp" || mode === "verifyEmail") && (
                    <OtpField register={register} errors={errors}/>
                )}

                {/* --- ADDED: Resend OTP Button --- */}
                {mode === 'verifyEmail' && (
                    <div className="text-center text-sm">
                        Didn't receive the code?{' '}
                        <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto font-semibold disabled:opacity-50"
                            onClick={handleResendOtp}
                            disabled={isLoading || isResending}
                        >
                            {isResending ? 'Sending...' : 'Resend OTP'}
                        </Button>
                    </div>
                )}

                {mode === "anon" && (
                    <AnonNameField register={register} errors={errors}/>
                )}

                <Button type="submit" disabled={isLoading || isResending} className="mt-2">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {getButtonText()}
                </Button>
            </form>

            {message && (
                <p className={`mt-4 text-center text-sm font-medium ${message.type === AuthMessageType.ERROR ? "text-red-500" : "text-green-500"}`}>
                    {message.text}
                </p>
            )}
        </>
    );
}