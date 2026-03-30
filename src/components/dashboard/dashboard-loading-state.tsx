type DashboardLoadingStateProps = {
  label: string;
};

export function DashboardLoadingState({ label }: DashboardLoadingStateProps) {
  return (
    <div className="grid gap-4">
      <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5 text-sm text-[var(--on-surface-variant)]">
        {label}
      </div>
      <div className="grid gap-3">
        <div className="h-24 animate-pulse rounded-[1.75rem] bg-[rgba(236,238,240,0.92)]" />
        <div className="h-24 animate-pulse rounded-[1.75rem] bg-[rgba(236,238,240,0.92)]" />
      </div>
    </div>
  );
}
