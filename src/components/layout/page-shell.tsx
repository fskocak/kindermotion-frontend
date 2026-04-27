import type { ReactNode } from "react";

type PageShellProps = {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PageShell({
  badge,
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10 sm:px-10 sm:py-14">
      <section className="km-glass relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_var(--hero-glow)_0%,_transparent_58%)]" />
        <div className="relative flex max-w-3xl flex-col gap-5">
          <span className="w-fit rounded-full border border-[var(--panel-border)] bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
            {badge}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--on-surface)] sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--on-surface-variant)] sm:text-lg">
            {description}
          </p>
        </div>
      </section>
      {children}
    </main>
  );
}
