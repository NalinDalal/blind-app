"use client";

import { Bell, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type JSX, useState } from "react";
import toast from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/AuthSlice";
import { ThemeToggle } from "./ThemeToggle";

const MENU_ITEMS = [
  { href: "/", label: "Feed" },
  { href: "/search", label: "Discover" },
  { href: "/me", label: "Profile" },
  { href: "/notifications", label: "Activity" },
];

const InstagramLayout = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Signed out");
      setIsMenuOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-void">
      <header className="fixed top-0 left-0 right-0 z-40 bg-void/80 backdrop-blur-xl border-b border-subtle">
        <div className="flex items-center justify-between h-16 px-4 max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-surface transition-colors"
              aria-label="Menu"
            >
              <Menu size={20} className="text-foreground" />
            </button>
            <Link href="/" className="relative">
              <span 
                className="text-2xl font-bold tracking-tight font-[family-name:var(--font-space-mono)] text-foreground"
                style={{ letterSpacing: "-0.02em" }}
              >
                BLIND
              </span>
              <span 
                className="absolute -bottom-1 left-0 w-full h-px bg-[rgb(var(--accent))]"
              />
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                href="/notifications"
                className="relative p-2 rounded-lg hover:bg-surface transition-colors"
                aria-label="Notifications"
              >
                <Bell size={20} className="text-foreground" />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-surface hover:bg-surface-elevated text-foreground transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-void/95 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsMenuOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="absolute top-0 left-0 w-72 h-full bg-surface border-r border-subtle p-6 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="document"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold font-[family-name:var(--font-space-mono)] text-foreground">
                MENU
              </span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                aria-label="Close menu"
              >
                <X size={20} className="text-foreground" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {MENU_ITEMS.map(({ href, label }) => {
                const isActive = href === "/" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      group flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${isActive 
                        ? "bg-surface-elevated text-foreground" 
                        : "text-muted hover:text-foreground hover:bg-surface"
                      }
                    `}
                  >
                    <span className={`
                      w-1 h-5 rounded-full transition-all
                      ${isActive ? "bg-[rgb(var(--accent))]" : "bg-transparent group-hover:bg-border"}
                    `} />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 rounded-lg font-medium text-muted hover:text-[rgb(var(--destructive))] hover:bg-surface transition-colors text-left px-4"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-3 rounded-lg font-medium text-center bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/90 text-foreground transition-colors"
                >
                  Get started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="pt-16 pb-20 max-w-lg mx-auto">
        <div className="gradient-radial absolute top-0 left-0 right-0 h-48 pointer-events-none" />
        {children}
      </main>

      <BottomNav />
    </div>
  );
};

export default InstagramLayout;
