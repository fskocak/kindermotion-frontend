import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-[1.4rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface)] outline-none transition-all placeholder:text-[rgba(62,72,80,0.56)] focus:bg-[var(--surface-container-lowest)] focus:ring-4 focus:ring-[rgba(14,165,233,0.18)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
