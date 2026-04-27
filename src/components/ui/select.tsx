import * as React from "react";

import { cn } from "@/lib/utils";

function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "flex h-12 w-full rounded-[1.4rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface)] outline-none transition-all focus:bg-[var(--surface-container-lowest)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
