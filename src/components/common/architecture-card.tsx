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
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
