// components/auth/AuthForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react"; // <-- IMPORT useState
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  login,
  register as registerUser,
  requestOtp,
  requestOtpEmailVerification,
  setAnonName,
  verifyEmailOtp,
  verifyOtp,
} from "@/redux/slices/AuthSlice";
import { AuthMessageType } from "@/redux/types";
import { type Auth, AuthSchema } from "@/Schema/Auth";
import { AnonNameField } from "./AnonNameField";
import { AuthToggle } from "./AuthToggle";
import { EmailField } from "./EmailField";
import { OtpField } from "./OtpField";
import { PasswordField } from "./PasswordField";

export type AuthMode = "register" | "login" | "otp" | "anon" | "verifyEmail";

type AuthFormProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

/**
 * Render an authentication form that supports register, login, OTP, anonymous name, and email verification modes.
 *
 * The form conditionally renders fields and actions based on `mode`, manages OTP resend state, and dispatches
 * authentication-related actions (register, login, request/verify OTP, set anonymous name, verify email).
 *
 * @param mode - Active form mode: "register" | "login" | "otp" | "anon" | "verifyEmail"
 * @param onModeChange - Callback invoked when the user switches authentication modes
 * @returns The authentication form component's JSX element
 */
export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const dispatch = useAppDispatch();
  const {
    status,
    message,
    email: authEmail,
  } = useAppSelector((state) => state.auth);

  // --- ADDED: State for resend button loading ---
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Auth>({
    resolver: zodResolver(AuthSchema),
    defaultValues: {
      mode,
      email: authEmail ?? "",
      password: "",
      otp: "",
      anonName: "",
    },
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
      await dispatch(
        requestOtpEmailVerification({ email: authEmail }),
      ).unwrap();
      toast.success("A new OTP has been sent.");
    } catch {
      // Error toast is handled by the slice's `handleFailure` reducer
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: Auth) => {
    try {
      switch (mode) {
        case "register":
          if (!data.email || !data.password) {
            toast.error("Email and password are required.");
            return;
          }
          await dispatch(
            registerUser({ email: data.email, password: data.password }),
          ).unwrap();
          break;

        case "login":
          if (!data.email || !data.password) {
            toast.error("Email and password are required.");
            return;
          }
          await dispatch(
            login({ email: data.email, password: data.password }),
          ).unwrap();
          break;

        case "verifyEmail":
          if (!authEmail || !data.otp) {
            toast.error("Email and OTP are required.");
            return;
          }
          await dispatch(
            verifyEmailOtp({ email: authEmail, otp: data.otp }),
          ).unwrap();
          break;

        case "otp":
          if (data.otp) {
            await dispatch(
              verifyOtp({ email: data.email || "", otp: data.otp }),
            ).unwrap();
          } else {
            await dispatch(requestOtp({ email: data.email || "" })).unwrap();
            toast.success("OTP for login sent to your email!");
          }
          break;

        case "anon":
          if (!data.anonName) {
            toast.error("Anonymous name is required.");
            return;
          }
          await dispatch(setAnonName({ anonName: data.anonName })).unwrap();
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
        <AuthToggle mode={mode} onModeChange={onModeChange} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {(mode === "login" || mode === "register" || mode === "otp") && (
          <EmailField register={register} errors={errors} />
        )}

        {(mode === "login" || mode === "register") && (
          <PasswordField register={register} errors={errors} mode={mode} />
        )}

        {(mode === "otp" || mode === "verifyEmail") && (
          <OtpField register={register} errors={errors} />
        )}

        {/* --- ADDED: Resend OTP Button --- */}
        {mode === "verifyEmail" && (
          <div className="text-center text-sm">
            Didn't receive the code?{" "}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-semibold disabled:opacity-50"
              onClick={handleResendOtp}
              disabled={isLoading || isResending}
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </Button>
          </div>
        )}

        {mode === "anon" && (
          <AnonNameField register={register} errors={errors} />
        )}

        <Button
          type="submit"
          disabled={isLoading || isResending}
          className="mt-2"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonText()}
        </Button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm font-medium ${message.type === AuthMessageType.ERROR ? "text-red-500" : "text-green-500"}`}
        >
          {message.text}
        </p>
      )}
    </>
  );
}
