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
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="gradient-radial absolute top-0 left-0 right-0 h-64 pointer-events-none opacity-50" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <span 
              className="text-4xl font-bold font-[family-name:var(--font-space-mono)] text-foreground tracking-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              BLIND
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            {title}
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-subtle shadow-2xl">
          {children}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted">
            <Link
              href="/"
              className="text-foreground hover:text-[rgb(var(--accent))] transition-colors font-medium"
            >
              Back to feed
            </Link>
          </p>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-muted/60">
            Anonymous. Secure. Yours.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
