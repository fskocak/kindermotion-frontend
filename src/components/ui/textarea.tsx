import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-[1.4rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface)] outline-none transition-all placeholder:text-[var(--placeholder)] focus:bg-[var(--surface-container-lowest)] focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
