"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Renders a circular button that toggles the application's color theme between light and dark.
 *
 * The button displays a Sun icon in light theme and a Moon icon in dark theme, and includes a visually hidden label "Toggle theme" for screen readers.
 *
 * @returns A React element representing the theme toggle button.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme: theme } = useTheme();

  return (
    <button
      type={"button"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}