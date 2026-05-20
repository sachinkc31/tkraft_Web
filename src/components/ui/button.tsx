"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[hsl(217,70%,38%)] text-white hover:bg-[hsl(217,70%,32%)] active:scale-[0.98] focus-visible:ring-[hsl(217,70%,38%)] shadow-md hover:shadow-lg",
        secondary:
          "bg-[hsl(27,96%,55%)] text-white hover:bg-[hsl(27,96%,47%)] active:scale-[0.98] focus-visible:ring-[hsl(27,96%,55%)] shadow-md hover:shadow-lg",
        outline:
          "border-2 border-[hsl(217,70%,38%)] text-[hsl(217,70%,38%)] hover:bg-[hsl(217,70%,38%)] hover:text-white active:scale-[0.98]",
        ghost:
          "text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)] hover:text-[hsl(222,47%,11%)] active:scale-[0.98]",
        danger:
          "bg-[hsl(0,72%,51%)] text-white hover:bg-[hsl(0,72%,44%)] active:scale-[0.98] focus-visible:ring-[hsl(0,72%,51%)]",
        link: "text-[hsl(217,70%,38%)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm:  "h-8  px-3  text-sm",
        md:  "h-10 px-5  text-sm",
        lg:  "h-12 px-7  text-base",
        xl:  "h-14 px-9  text-lg",
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
