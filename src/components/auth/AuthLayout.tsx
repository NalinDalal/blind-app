// components/auth/AuthLayout.tsx
import type React from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

/**
 * Renders a centered authentication card layout with a title, subtitle, and content area.
 *
 * @param title - The card title text displayed prominently.
 * @param subtitle - Secondary text displayed below the title.
 * @param children - React nodes rendered inside the card below the subtitle.
 * @returns A React element containing the styled auth card.
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 font-sans bg-gray-100/50 dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
