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
        "flex h-12 w-full rounded-[1.4rem] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-4 py-3 text-sm font-medium text-[var(--on-surface)] outline-none transition-all focus:border-[var(--primary)] focus:bg-[var(--surface-container-lowest)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 [&_option]:bg-white [&_option]:text-slate-900 [&_option:checked]:bg-sky-100 [&_option:checked]:text-slate-950",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
