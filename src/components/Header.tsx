"use client";

import {Loader2, Menu, X} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {type JSX, useEffect, useRef, useState} from "react";
import toast from "react-hot-toast";
import {MobileDrawerPortal} from "@/components/MobileDrawerPortal";
import {Button} from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import {useAppDispatch, useAppSelector} from "@/redux/hooks";
import {logoutUser} from "@/redux/slices/AuthSlice";
import {cn} from "@/utils/ui";
import {ThemeToggle} from "./ThemeToggle";

/**
 * Navigation links used across desktop and mobile.
 */
const NAV_LINKS = [
    {href: "/", label: "Explore"},
    {href: "/about", label: "About Us"},
];

/**
 * Header component with improved mobile drawer scrim + accessibility.
 *
 * Improvements:
 * - stronger, theme-aware scrim (`bg-slate-900/70` or `dark:bg-black/70`) for better contrast
 * - pointer-events disabled when overlay hidden to avoid accidental taps
 * - smooth transitions for overlay opacity + drawer translate
 * - rounded-left drawer and safe-area padding for better mobile UX
 * - focuses close button when drawer opens for keyboard users
 *
 * @returns {JSX.Element}
 */
const Header = (): JSX.Element => {
    const pathname = usePathname();
    const {isAuthenticated, status} = useAppSelector((s) => s.auth);
    const dispatch = useAppDispatch();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);

    // Lock body scroll while drawer is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isMenuOpen]);

    // Focus the close button when drawer opens (accessibility)
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

    /**
     * Auth area — renders Login link or Logout button.
     */
    const AuthButton = ({isMobile = false}: { isMobile?: boolean }) => (
        <>
            {isAuthenticated ? (
                <>
                    <Link href={"/me"}>
                    <Button
                        variant="link-no-hover"
                        size="sm"
                        className={cn(
                            "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50",
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
                            "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50",
                            isMobile && "w-full justify-start text-base",
                        )}
                    >
                        {status === "loading" && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        )}
                        Logout
                    </Button>
                </>
            ) : (
                <Link
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                        "font-medium transition-colors hover:text-gray-900 dark:hover:text-gray-50",
                        isActiveLink("/auth")
                            ? "text-gray-900 dark:text-gray-50"
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
        <header
            className="sticky top-0 z-40 w-full border-b border-gray-200 bg-gray-50/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                {/* Logo */}
                <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2"
                >
                    <Logo/>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {NAV_LINKS.map(({href, label}) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "font-medium transition-colors hover:text-gray-900 dark:hover:text-gray-50",
                                isActiveLink(href)
                                    ? "text-gray-900 dark:text-gray-50"
                                    : "text-gray-600 dark:text-gray-400",
                            )}
                        >
                            {label}
                        </Link>
                    ))}
                    <AuthButton/>
                </nav>

                {/* Right side controls */}
                <div className="flex items-center gap-2">
                    <ThemeToggle/>
                    <Button
                        onClick={() => setIsMenuOpen((p) => !p)}
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-drawer"
                    >
                        {isMenuOpen ? <X/> : <Menu/>}
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </div>
            </div>

            <MobileDrawerPortal
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            >
                <div className="flex items-center justify-between">
                    <span className="font-bold">Menu</span>
                    <Button
                        onClick={() => setIsMenuOpen(false)}
                        variant="ghost"
                        size="icon"
                        ref={closeBtnRef} // accessibility focus ref
                        aria-label="Close menu"
                    >
                        <X/>
                        <span className="sr-only">Close menu</span>
                    </Button>
                </div>

                <nav className="mt-8 flex flex-col gap-6">
                    {NAV_LINKS.map(({href, label}) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                "text-lg font-medium",
                                isActiveLink(href)
                                    ? "text-blue-900 dark:text-blue-50"
                                    : "text-gray-600 dark:text-gray-400",
                            )}
                        >
                            {label}
                        </Link>
                    ))}

                    <AuthButton isMobile/>
                </nav>
            </MobileDrawerPortal>
        </header>
    );
};

export default Header;
