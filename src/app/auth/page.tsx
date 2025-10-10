"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearMessage,
  login,
  register as registerUser,
  requestOtp,
  setAnonName,
  verifyOtp,
} from "@/redux/slices/AuthSlice";
import { AuthMessageType } from "@/redux/types";
import { type Auth, AuthSchema } from "@/Schema/Auth"; // Make sure path is correct

type AuthMode = "register" | "login" | "otp" | "anon";

/**
 * Render the authentication page UI supporting register, login, OTP, and anonymous-name flows.
 *
 * Handles form validation, dispatches authentication-related Redux actions, shows toast feedback,
 * and navigates on successful authentication.
 *
 * @returns The authentication page UI as a JSX.Element
 */
export default function AuthPage() {
  const router = useRouter();
  // 1. Single Source of Truth: This state now correctly drives the entire component's UI.
  const [mode, setMode] = useState<AuthMode>("register");
  const dispatch = useAppDispatch();
  const { message, status, isAuthenticated, anonName } = useAppSelector(
    (state) => state.auth,
  );

  const {
    register, // Renamed to avoid conflict with the action
    handleSubmit,
    formState: { errors },
    watch,
    setValue, // 2. Key Fix: We'll use setValue to keep the form state in sync.
    reset,
  } = useForm<Auth>({
    resolver: zodResolver(AuthSchema),
    // We set a default mode, but it will be immediately synced by the useEffect below.
    defaultValues: {
      mode: "register",
      email: "",
      password: "",
      otp: "",
      anonName: "",
    },
  });

  const otpValue = watch("otp");
  const isLoading = status === "loading";

  // 3. Robust State Synchronization: This effect ensures the form's mode
  // always matches the component's state, and handles auth state changes.
  useEffect(() => {
    // If the user is authenticated, decide where to go
    if (isAuthenticated) {
      if (anonName) {
        // If anonName is set, redirect to the home page
        toast.success("Welcome back!");
        router.push("/");
      } else {
        // If anonName is NOT set, switch to 'anon' mode to prompt the user
        setMode("anon");
      }
    }

    // This part remains to sync the form's mode for validation
    setValue("mode", mode, { shouldValidate: true });
  }, [mode, isAuthenticated, anonName, setValue, router]);

  // 4. Clean & Asynchronous Submit Handler
  const onSubmit = async (data: Auth) => {
    // No more manual validation! Zod handles it all.
    try {
      switch (data.mode) {
        case "register":
          if (data.password) {
            await dispatch(
              registerUser({ email: data.email, password: data.password }),
            ).unwrap();
            toast.success("Account created! Please login.");
            handleModeChange("login");
          } else {
            toast.error("Password is required.");
          }
          break;

        case "login":
          if (data.password) {
            await dispatch(
              login({ email: data.email, password: data.password }),
            ).unwrap();
            // The useEffect will handle switching to 'anon' mode
          } else {
            toast.error("Password is required.");
          }
          break;

        case "otp":
          if (data.otp) {
            // User is verifying an OTP
            await dispatch(
              verifyOtp({ email: data.email, otp: data.otp }),
            ).unwrap();
          } else {
            // User is requesting an OTP
            await dispatch(requestOtp({ email: data.email })).unwrap();
            toast.success("OTP sent to your email!");
          }
          break;

        case "anon":
          if (data.anonName) {
            await dispatch(setAnonName({ anonName: data.anonName })).unwrap();
            toast.success("You are all set!");
            router.push("/");
            // Here you would typically redirect the user, e.g., router.push('/dashboard')
          } else {
            toast.error("Anonymous name is required.");
          }
          break;
      }
    } catch (error) {
      // .unwrap() throws the error, so we can catch it here elegantly.
      // The toast is likely handled by your slice's extraReducers, but you could add one here as a fallback.
      console.error("Authentication failed:", error);
    }
  };

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  const currentEmail = watch("email");

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    dispatch(clearMessage());
    // Reset form errors when switching modes
    reset(
      {
        mode: newMode,
        email: currentEmail || "",
        password: "",
        otp: "",
        anonName: "",
      }, // Keep email, reset other fields
      { keepErrors: false },
    );
  };

  // 5. Optimized Button Text Logic
  const getButtonText = () => {
    if (isLoading) return "Processing...";
    const texts: Record<AuthMode, string> = {
      register: "Create Account",
      login: "Sign In",
      otp: otpValue ? "Verify OTP & Login" : "Send OTP",
      anon: "Set Anonymous Name",
    };
    return texts[mode];
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 font-sans bg-gray-100/50 dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-gray-200">
          Welcome to Blind App
        </h2>
        {/* Simplified paragraph rendering */}
        <p className="text-sm text-gray-500 text-center mb-6">
          {
            {
              register: "Create an account to join the community.",
              login: "Sign in to your account.",
              otp: "Verify with a one-time password.",
              anon: "Secure your identity.",
            }[mode]
          }
        </p>

        {/* This section is hidden if user is authenticated and setting anon name */}
        {mode !== "anon" && (
          <div className="flex justify-center gap-2 mb-6">
            <Button
              variant={mode === "register" ? "default" : "outline"}
              onClick={() => handleModeChange("register")}
            >
              Register
            </Button>
            <Button
              variant={mode === "login" ? "default" : "outline"}
              onClick={() => handleModeChange("login")}
            >
              Login
            </Button>
            <Button
              variant={mode === "otp" ? "default" : "outline"}
              onClick={() => handleModeChange("otp")}
            >
              OTP
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Email Field (Used in multiple modes, hidden in 'anon') */}
          {mode !== "anon" && (
            <div>
              <Input
                {...register("email")}
                placeholder="college-email@oriental.ac.in"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}

          {/* Password Field */}
          {(mode === "login" || mode === "register") && (
            <div>
              <Input
                {...register("password")}
                type="password"
                placeholder="Password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {/* OTP Field */}
          {mode === "otp" && (
            <div>
              <Input
                {...register("otp")}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                autoComplete="one-time-code"
              />
              {errors.otp && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.otp.message}
                </p>
              )}
            </div>
          )}

          {/* Anon Name Field */}
          {mode === "anon" && (
            <div>
              <Input
                {...register("anonName")}
                placeholder="Choose your anonymous name"
              />
              {errors.anonName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.anonName.message}
                </p>
              )}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonText()}
          </Button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message.type === AuthMessageType.ERROR
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
