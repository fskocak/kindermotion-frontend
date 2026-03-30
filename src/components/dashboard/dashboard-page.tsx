import type { ReactNode } from "react";

type DashboardPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function DashboardPage({
  eyebrow,
  title,
  description,
  children,
}: DashboardPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="km-glass rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
        <p className="km-eyebrow mb-4 text-xs font-semibold">{eyebrow}</p>
        <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-[var(--on-surface)] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--on-surface-variant)]">
          {description}
        </p>
      </section>
      {children}
    </div>
  );
}
