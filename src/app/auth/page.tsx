"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearMessage,
  login,
  register,
  requestOtp,
  setAnonName,
  verifyOtp,
} from "@/redux/slices/AuthSlice";
import { AuthMessageType } from "@/redux/types";
import { type Auth, AuthSchema } from "@/Schema/Auth";

type AuthMode = "register" | "login" | "otp" | "anon";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("register");
  const dispatch = useAppDispatch();
  const { message, status, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Auth>({
    resolver: zodResolver(AuthSchema),
    // Set mode in default values to help with conditional validation
    defaultValues: {
      mode: "register",
      email: "",
      password: "",
      otp: "",
      anonName: "",
    },
  });

  const emailValue = watch("email");
  const otpValue = watch("otp");
  const isLoading = status === "loading";

  useEffect(() => {
    if (isAuthenticated) {
      setMode("anon");
    }
  }, [isAuthenticated]);

  const onSubmit = (data: Auth) => {
    // The 'mode' is now part of the form data
    switch (data.mode) {
      case "register":
        dispatch(register({ email: data.email, password: data.password! }))
          .unwrap()
          .then(() => setMode("login"));
        break;
      case "login":
        dispatch(login({ email: data.email, password: data.password! }));
        break;
      case "otp":
        // If the user has typed an OTP, verify it. Otherwise, request one.
        if (data.otp) {
          dispatch(verifyOtp({ email: data.email, otp: data.otp }));
        } else {
          dispatch(requestOtp({ email: data.email }));
        }
        break;
      case "anon":
        if (data.anonName) {
          dispatch(setAnonName({ anonName: data.anonName }))
            .unwrap()
            .then(() => alert("You are all set!")); // Or redirect
        }
        break;
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    dispatch(clearMessage());
  };

  const getButtonText = () => {
    if (isLoading) return "Loading...";
    switch (mode) {
      case "register":
        return "Create Account";
      case "login":
        return "Sign In";
      case "otp":
        // The button text changes based on whether the OTP field is filled
        return otpValue ? "Verify OTP & Login" : "Send OTP";
      case "anon":
        return "Set Anonymous Name";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 font-sans bg-gray-100/50 dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-gray-200">
          Welcome to Blind App
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {mode === "register" && "Create an account to join the community."}
          {mode === "login" && "Sign in to your account."}
          {mode === "otp" && "Verify with a one-time password."}
          {mode === "anon" && "Secure your identity."}
        </p>

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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Hidden input to track the current mode for validation */}
          <Input type="hidden" value={mode} {...formRegister("mode")} />

          {/* Email Field (Used in multiple modes) */}
          <div className={mode === "anon" ? "hidden" : ""}>
            <Input
              {...formRegister("email")}
              placeholder="college-email@oriental.ac.in"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div
            className={mode === "login" || mode === "register" ? "" : "hidden"}
          >
            <Input
              {...formRegister("password")}
              type="password"
              placeholder="Password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* OTP Field */}
          <div className={mode === "otp" ? "" : "hidden"}>
            <Input
              {...formRegister("otp")}
              placeholder="Enter OTP (if you have one)"
            />
            {errors.otp && (
              <p className="text-red-500 text-xs mt-2">{errors.otp.message}</p>
            )}
          </div>

          {/* Anon Name Field */}
          <div className={mode === "anon" ? "" : "hidden"}>
            <Input
              {...formRegister("anonName")}
              placeholder="Choose your anonymous name"
            />
            {errors.anonName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.anonName.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="mt-2">
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
      </div>
    </div>
  );
}
