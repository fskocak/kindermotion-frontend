import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const mutationFeedbackVariants = cva(
  "rounded-[1.5rem] px-4 py-3 text-sm leading-6",
  {
    variants: {
      variant: {
        error: "bg-[rgba(255,218,214,0.72)] text-[var(--on-error-container)]",
        neutral:
          "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  },
);

type MutationFeedbackProps = {
  message: string;
  className?: string;
} & VariantProps<typeof mutationFeedbackVariants>;

export function MutationFeedback({
  message,
  variant,
  className,
}: MutationFeedbackProps) {
  return (
    <div className={cn(mutationFeedbackVariants({ variant }), className)}>
      {message}
    </div>
  );
}
