"use client";

import { Heart, Home, MessageCircle, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/notifications", icon: Heart, label: "Notifications" },
  { href: "/me", icon: User, label: "Profile" },
];

const BottomNav = (): JSX.Element => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-t border-subtle safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px]
                ${active
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
                }
              `}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.5}
                  className={`
                    transition-transform duration-200
                    ${active ? "scale-110" : ""}
                  `}
                />
                {active && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[rgb(var(--accent))]" />
                )}
              </div>
              <span className={`
                text-[10px] font-medium mt-1 font-[family-name:var(--font-space-mono)]
                ${active ? "opacity-100" : "opacity-60"}
              `}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
