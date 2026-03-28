"use client";

import { Home, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";
import { cn } from "@/utils/ui";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/me", icon: User, label: "Profile" },
];

const BottomNav = (): JSX.Element => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center p-3 transition-colors relative",
                active
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400",
              )}
              aria-label={label}
            >
              <Icon
                size={24}
                className={cn(
                  "transition-transform duration-200",
                  active && "scale-110",
                )}
                fill={active ? "currentColor" : "none"}
              />
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-neutral-900 dark:bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
