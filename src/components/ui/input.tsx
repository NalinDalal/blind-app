import React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={`
        flex h-12 w-full rounded-lg border border-default bg-surface px-4 py-3 
        text-sm text-foreground placeholder:text-muted 
        focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent
        disabled:cursor-not-allowed disabled:opacity-50 
        transition-all duration-200
        ${className}
      `}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
