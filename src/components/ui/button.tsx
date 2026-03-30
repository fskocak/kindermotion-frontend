import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-tight transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(14,165,233,0.18)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "km-gradient text-white shadow-[0_16px_36px_rgba(0,101,145,0.18)]",
        secondary:
          "bg-[var(--surface-container-low)] text-[var(--on-surface)]",
        ghost:
          "bg-transparent text-[var(--on-surface-variant)] hover:bg-white/50",
        outline:
          "bg-[var(--surface-container-lowest)] text-[var(--on-surface)] ring-1 ring-[rgba(190,200,210,0.4)]",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2",
        lg: "h-14 px-7 py-4 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
