"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme: theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-surface animate-pulse" />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="relative p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer group"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun 
          size={18} 
          className={`
            absolute inset-0 transition-all duration-300
            ${theme === "dark" ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}
            text-foreground
          `} 
        />
        <Moon 
          size={18} 
          className={`
            absolute inset-0 transition-all duration-300
            ${theme === "light" ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}
            text-foreground
          `} 
        />
      </div>
    </button>
  );
}
