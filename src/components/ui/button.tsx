import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/utils/ui";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-[rgb(var(--background))] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[rgb(var(--foreground))] text-[rgb(var(--background))] hover:bg-[rgb(var(--foreground))]/90 active:scale-[0.98]",
        destructive:
          "bg-[rgb(var(--destructive))] text-foreground hover:bg-[rgb(var(--destructive))]/90",
        outline:
          "border border-default bg-transparent hover:bg-surface text-foreground",
        secondary:
          "bg-surface text-foreground hover:bg-surface-elevated",
        ghost:
          "hover:bg-surface text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        "link-no-hover": "text-foreground",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-lg px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
