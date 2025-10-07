/**
 * @fileoverview UI utility functions for class name manipulation.
 * Provides a utility to merge Tailwind CSS classes with conflict resolution.
 * @module utils/ui
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS conflict resolution.
 * Merges multiple class name inputs and resolves Tailwind class conflicts.
 *
 * @function cn
 * @param {...ClassValue[]} inputs - Class names, objects, or arrays to merge
 * @returns {string} Merged class string with conflicts resolved
 *
 * @example
 * // Simple class merging
 * cn("px-2 py-1", "px-4") // Returns: "py-1 px-4"
 *
 * @example
 * // Conditional classes with objects
 * cn("text-base", { "text-lg": isLarge, "font-bold": isBold })
 *
 * @example
 * // Array of classes
 * cn(["flex", "items-center"], "gap-2")
 *
 * @example
 * // Complex usage in a component
 * <Button className={cn(
 *   "rounded-lg px-4 py-2",
 *   variant === "primary" && "bg-blue-500",
 *   variant === "secondary" && "bg-gray-500",
 *   disabled && "opacity-50 cursor-not-allowed"
 * )} />
 *
 * @description
 * This utility combines two powerful libraries:
 * - `clsx`: Handles conditional class names and various input formats
 * - `twMerge`: Resolves Tailwind CSS class conflicts (e.g., px-2 vs px-4)
 *
 * Use this function whenever you need to conditionally apply or merge
 * Tailwind classes in your components.
 *
 * @see {@link https://github.com/dcastil/tailwind-merge} twMerge documentation
 * @see {@link https://github.com/lukeed/clsx} clsx documentation
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
