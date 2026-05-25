import { cva, type VariantProps } from "class-variance-authority";
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  XCircle
} from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

const feedbackBoxVariants = cva(
  "relative flex w-full flex-col gap-1 overflow-hidden rounded-[1.5rem] border px-4 py-4 transition-all duration-300",
  {
    variants: {
      variant: {
        error: [
          "bg-[var(--error-container)] text-[var(--on-error-container)] border-[rgba(248,113,113,0.2)]",
          "shadow-[0_8px_32px_rgba(248,113,113,0.12)]",
        ],
        success: [
          "bg-[var(--success-surface)] text-[var(--secondary)] border-[rgba(16,185,129,0.2)]",
          "shadow-[0_8px_32px_rgba(16,185,129,0.12)]",
        ],
        info: [
          "bg-[var(--surface-container-low)] text-[var(--on-surface)] border-[var(--panel-border)]",
          "shadow-[var(--shadow-cloud)]",
        ],
        warning: [
          "bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border-[rgba(251,191,36,0.2)]",
          "shadow-[0_8px_32px_rgba(251,191,36,0.1)]",
        ],
      },
      glass: {
        true: "backdrop-blur-md",
        false: "",
      },
    },
    defaultVariants: {
      variant: "info",
      glass: true,
    },
  }
);

const iconMap = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

type FeedbackBoxProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof feedbackBoxVariants> & {
    title?: string;
    description?: string;
    icon?: React.ElementType;
    showIcon?: boolean;
  };

export function FeedbackBox({
  variant = "info",
  glass,
  title,
  description,
  icon: CustomIcon,
  showIcon = true,
  className,
  children,
  ...props
}: FeedbackBoxProps) {
  const Icon = CustomIcon || iconMap[variant || "info"];

  return (
    <div
      className={cn(feedbackBoxVariants({ variant, glass, className }))}
      {...props}
    >
      <div className="flex items-start gap-3">
        {showIcon && Icon && (
          <div className="mt-0.5 shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          {title && (
            <h4 className="text-sm font-bold tracking-tight leading-none">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm leading-relaxed opacity-90">
              {description}
            </p>
          )}
          {children && (
            <div className="mt-1 text-sm leading-relaxed">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
