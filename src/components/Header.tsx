"use client";

import { Loader2, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type JSX, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { MobileDrawerPortal } from "@/components/MobileDrawerPortal";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/AuthSlice";
import { cn } from "@/utils/ui";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [{ href: "/", label: "Explore" }];

const Header = (): JSX.Element => {
  const pathname = usePathname();
  const { isAuthenticated, status } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      closeBtnRef.current?.focus();
    }
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logout successful");
    } catch (err: unknown) {
      console.error("Failed to logout:", err);
      toast.error(err instanceof Error ? err.message : "Failed to logout");
    } finally {
      setIsMenuOpen(false);
    }
  };

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  const AuthButton = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {isAuthenticated ? (
        <>
          <Link href={"/me"}>
            <Button
              variant="link-no-hover"
              size="sm"
              className={cn(
                "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full px-4",
                isMobile && "w-full justify-start text-base",
              )}
            >
              Profile
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            variant="link-no-hover"
            size="sm"
            disabled={status === "loading"}
            className={cn(
              "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full px-4",
              isMobile && "w-full justify-start text-base",
            )}
          >
            {status === "loading" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Logout
          </Button>
        </>
      ) : (
        <Link
          href="/auth"
          onClick={() => setIsMenuOpen(false)}
          className={cn(
            "font-medium transition-all duration-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full px-4 py-2",
            isActiveLink("/auth")
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
              : "text-gray-600 dark:text-gray-400",
            isMobile && "text-base",
          )}
        >
          Login
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50" />

      <div className="relative container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="flex items-center gap-2 group"
        >
          <div className="relative">
            <Logo />
            <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "font-medium transition-all duration-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full px-4 py-2",
                isActiveLink(href)
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                  : "text-gray-600 dark:text-gray-400",
              )}
            >
              {label}
            </Link>
          ))}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
          <AuthButton />
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            onClick={() => setIsMenuOpen((p) => !p)}
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-indigo-50 dark:hover:bg-indigo-500/20"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-drawer"
          >
            {isMenuOpen ? <X className="text-indigo-600" /> : <Menu />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      <MobileDrawerPortal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="font-bold text-lg">Menu</span>
          <Button
            onClick={() => setIsMenuOpen(false)}
            variant="ghost"
            size="icon"
            ref={closeBtnRef}
            aria-label="Close menu"
          >
            <X />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        <nav className="flex flex-col gap-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "text-base font-medium py-3 px-4 rounded-xl transition-all duration-200",
                isActiveLink(href)
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              {label}
            </Link>
          ))}

          <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-4" />

          <AuthButton isMobile />
        </nav>
      </MobileDrawerPortal>
    </header>
  );
};

export default Header;
