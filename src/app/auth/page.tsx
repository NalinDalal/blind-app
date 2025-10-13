// app/auth/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearMessage } from "@/redux/slices/AuthSlice";
import { AuthForm, AuthMode } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

/**
 * Get the previous value of a prop or state across renders.
 *
 * @param value - The current value to capture for the next render
 * @returns The value from the previous render, or `undefined` if there was no previous render
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * Main authentication page.
 * Manages the overall authentication flow by reacting to Redux state changes.
 */
export default function AuthenticationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // 1. Set the default mode to "login" for a better returning user experience.
  const [mode, setMode] = useState<AuthMode>("login");

  const { isAuthenticated, anonName, isVerified, email } = useAppSelector(
    (state) => state.auth,
  );

  const prevIsVerified = usePrevious(isVerified);

  useEffect(() => {
    // Flow 1: User is fully authenticated. Handle redirects or 'anon' mode.
    if (isAuthenticated) {
      if (anonName) {
        toast.success("Welcome back!");
        router.push("/");
      } else {
        setMode("anon");
      }
      return; // Exit early
    }

    // Flow 2: User is unauthenticated but in the middle of the verification flow.
    if (!isVerified && email) {
      setMode("verifyEmail");
    }

    // 2. The final "else" block that forced the mode to "register" has been removed.
    // If none of the above conditions are met, the component will now respect
    // the user's selected mode (login/register/otp) or the initial default.
  }, [isAuthenticated, anonName, isVerified, email, router]);

  // This effect remains to handle the one-time transition AFTER successful verification.
  useEffect(() => {
    if (prevIsVerified === false && isVerified === true && !isAuthenticated) {
      toast.success("Email verified! Please log in to continue.");
      setMode("login");
    }
  }, [isVerified, prevIsVerified, isAuthenticated]);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    dispatch(clearMessage());
  };

  const subtitles: Record<AuthMode, string> = {
    register: "Create an account to join the community.",
    login: "Sign in to your account.",
    otp: "Login with a one-time password.",
    verifyEmail: "Check your inbox for a verification code.",
    anon: "Secure your identity. This cannot be changed later.",
  };

  return (
    <AuthLayout title="Welcome to Blind App" subtitle={subtitles[mode]}>
      <AuthForm mode={mode} onModeChange={handleModeChange} />
    </AuthLayout>
  );
}
