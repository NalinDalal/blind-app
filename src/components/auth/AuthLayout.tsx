// components/auth/AuthLayout.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type React from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-sm p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 bg-clip-text text-transparent">
              Blind
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        <div className="mt-4 border border-neutral-200 dark:border-neutral-800 rounded-sm p-4 text-center">
          <p className="text-sm text-neutral-900 dark:text-white">
            Don't have an account?{" "}
            <Link
              href="/auth"
              className="text-blue-500 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            © 2024 Blind App
          </p>
        </div>
      </motion.div>
    </div>
  );
}
