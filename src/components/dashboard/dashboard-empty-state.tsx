import type { ReactNode } from "react";

type DashboardEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function DashboardEmptyState({
  title,
  description,
  action,
}: DashboardEmptyStateProps) {
  return (
    <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-6 text-sm leading-6 text-[var(--on-surface-variant)]">
      <p className="mb-2 text-base font-semibold text-[var(--on-surface)]">
        {title}
      </p>
      <p>{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
