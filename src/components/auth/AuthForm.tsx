"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
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

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const dispatch = useAppDispatch();
  const {
    status,
    message,
    email: authEmail,
  } = useAppSelector((state) => state.auth);

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
      toast.success("A new code has been sent.");
    } catch {
      // Error toast is handled by the slice
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
            toast.error("Code is required.");
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
            toast.success("Login code sent to your email!");
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
      otp: otpValue ? "Verify & Login" : "Send Login Code",
      verifyEmail: "Verify Email",
      anon: "Set Identity",
    };
    return texts[mode];
  };

  return (
    <>
      {mode !== "anon" && mode !== "verifyEmail" && (
        <AuthToggle mode={mode} onModeChange={onModeChange} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {(mode === "login" || mode === "register" || mode === "otp") && (
          <EmailField register={register} errors={errors} />
        )}

        {(mode === "login" || mode === "register") && (
          <PasswordField register={register} errors={errors} mode={mode} />
        )}

        {(mode === "otp" || mode === "verifyEmail") && (
          <OtpField register={register} errors={errors} />
        )}

        {mode === "verifyEmail" && (
          <div className="text-center text-sm">
            <span className="text-muted">Didn't receive the code? </span>
            <button
              type="button"
              className="text-foreground font-semibold hover:text-[rgb(var(--accent))] transition-colors disabled:opacity-50"
              onClick={handleResendOtp}
              disabled={isLoading || isResending}
            >
              {isResending ? "Sending..." : "Resend"}
            </button>
          </div>
        )}

        {mode === "anon" && (
          <AnonNameField register={register} errors={errors} />
        )}

        <Button
          type="submit"
          disabled={isLoading || isResending}
          className="mt-2 h-12"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonText()}
        </Button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm font-medium ${message.type === AuthMessageType.ERROR ? "text-[rgb(var(--destructive))]" : "text-green-500"}`}
        >
          {message.text}
        </p>
      )}
    </>
  );
}
