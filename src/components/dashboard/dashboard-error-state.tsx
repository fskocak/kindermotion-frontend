import type { ReactNode } from "react";

type DashboardErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function DashboardErrorState({
  title,
  description,
  action,
}: DashboardErrorStateProps) {
  return (
    <div className="rounded-[1.75rem] bg-[var(--error-container)] p-6 text-sm leading-6 text-[var(--on-error-container)]">
      <p className="mb-2 text-base font-semibold">{title}</p>
      <p>{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
