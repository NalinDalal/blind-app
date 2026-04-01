"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AuthForm, type AuthMode } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearMessage } from "@/redux/slices/AuthSlice";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function AuthenticationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<AuthMode>("login");

  const { isAuthenticated, anonName, isVerified, email } = useAppSelector(
    (state) => state.auth,
  );

  const prevIsVerified = usePrevious(isVerified);

  useEffect(() => {
    if (isAuthenticated) {
      if (anonName) {
        toast.success("Welcome back!");
        router.push("/");
      } else {
        setMode("anon");
      }
      return;
    }

    if (!isVerified && email) {
      setMode("verifyEmail");
    }
  }, [isAuthenticated, anonName, isVerified, email, router]);

  useEffect(() => {
    if (prevIsVerified === false && isVerified === true && !isAuthenticated) {
      toast.success("Email verified!");
      setMode("login");
    }
  }, [isVerified, prevIsVerified, isAuthenticated]);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    dispatch(clearMessage());
  };

  const subtitles: Record<AuthMode, string> = {
    register: "Join the anonymous community.",
    login: "Access your anonymous identity.",
    otp: "Quick login with a code.",
    verifyEmail: "Check your inbox for a verification code.",
    anon: "Claim your anonymous identity. This cannot be changed.",
  };

  return (
    <AuthLayout title="Enter the Void" subtitle={subtitles[mode]}>
      <AuthForm mode={mode} onModeChange={handleModeChange} />
    </AuthLayout>
  );
}
