import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/ui";

/**
 * Render overlay & drawer into document.body to avoid ancestor stacking/transform issues.
 */
export const MobileDrawerPortal = ({
  children,
  isOpen,
  onClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div aria-hidden={!isOpen}>
      {/* Overlay / Scrim */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[900] transition-opacity duration-300 md:hidden",
          "bg-slate-900/80 dark:bg-black/80",
          isOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none",
        )}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed top-0 right-0 z-[1000] h-full w-3/5 max-w-sm transform-gpu bg-white p-6 shadow-2xl transition-transform duration-300 dark:bg-gray-950 md:hidden",
          "rounded-l-2xl pt-6 pb-[env(safe-area-inset-bottom)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {children}
      </aside>
    </div>,
    document.body,
  );
};
