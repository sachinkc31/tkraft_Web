"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-surface))] hover:bg-[hsl(var(--color-primary-dark))] active:scale-[0.98] focus-visible:ring-[hsl(var(--color-primary))] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]",
        secondary:
          "bg-[hsl(var(--color-accent))] text-[hsl(var(--color-surface))] hover:bg-[hsl(var(--color-accent-dark))] active:scale-[0.98] focus-visible:ring-[hsl(var(--color-accent))] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]",
        outline:
          "border-2 border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-surface))] active:scale-[0.98]",
        ghost:
          "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-surface3))] hover:text-[hsl(var(--color-text))] active:scale-[0.98]",
        danger:
          "bg-[hsl(var(--color-error))] text-[hsl(var(--color-surface))] hover:bg-[hsl(var(--color-error))] active:scale-[0.98] focus-visible:ring-[hsl(var(--color-error))]",
        link: "text-[hsl(var(--color-primary))] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm:  "h-8  px-3  text-[var(--font-size-sm)]",
        md:  "h-10 px-5  text-[var(--font-size-base)]",
        lg:  "h-12 px-7  text-[var(--font-size-base)]",
        xl:  "h-14 px-9  text-[var(--font-size-lg)]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  loading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : leftIcon ? (
        leftIcon
      ) : null}
      {children}
      {!loading && rightIcon ? rightIcon : null}
    </button>
  );
}
