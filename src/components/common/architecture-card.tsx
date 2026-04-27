import type { ReactNode } from "react";

type ArchitectureCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ArchitectureCard({
  title,
  description,
  children,
}: ArchitectureCardProps) {
  return (
    <section className="km-panel rounded-[1.75rem] p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--on-surface)]">
          {title}
        </h2>
        <p className="text-sm leading-6 text-[var(--on-surface-variant)] sm:text-base">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
