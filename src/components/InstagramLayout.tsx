"use client";

import { Bell, Camera, Menu, Send } from "lucide-react";
import Link from "next/link";
import { type JSX, useState } from "react";
import toast from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import { MobileDrawerPortal } from "@/components/MobileDrawerPortal";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/AuthSlice";
import { cn } from "@/utils/ui";
import { ThemeToggle } from "./ThemeToggle";

const MENU_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/me", label: "Profile" },
  { href: "/notifications", label: "Notifications" },
];

const InstagramLayout = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const { isAuthenticated, status } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between h-14 px-4 max-w-xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              aria-label="Menu"
            >
              <Menu size={24} className="text-neutral-900 dark:text-white" />
            </button>
            <Link href="/" className="font-bold text-xl tracking-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 bg-clip-text text-transparent">
                Blind
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                href="/notifications"
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                aria-label="Notifications"
              >
                <Bell size={24} className="text-neutral-900 dark:text-white" />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <MobileDrawerPortal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="font-bold text-lg">Menu</span>
          <Button
            onClick={() => setIsMenuOpen(false)}
            variant="ghost"
            size="icon"
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </Button>
        </div>

        <nav className="flex flex-col gap-2">
          {MENU_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-medium py-3 px-4 rounded-xl transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {label}
            </Link>
          ))}

          <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-4" />

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-base font-medium py-3 px-4 rounded-xl transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left text-red-500"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/auth"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-medium py-3 px-4 rounded-xl transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Sign in
            </Link>
          )}
        </nav>
      </MobileDrawerPortal>

      <main className="pt-14 pb-20 max-w-xl mx-auto">{children}</main>

      <BottomNav />
    </div>
  );
};

export default InstagramLayout;
