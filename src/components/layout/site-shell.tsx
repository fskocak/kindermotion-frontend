import type { ReactNode } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/theme/theme-toggle";

type SiteShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function SiteShell({
  title,
  description,
  eyebrow,
  children,
  actions,
  className,
}: SiteShellProps) {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="km-glass flex flex-col gap-5 rounded-[2rem] px-5 py-5 sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <BrandMark />
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin-login">Admin Login</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/teacher-login">Teacher Login</Link>
            </Button>
          </div>
        </header>

        <main className={cn("flex flex-1 flex-col gap-6", className)}>
          <section className="km-glass rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
            <div className="max-w-3xl">
              {eyebrow ? (
                <p className="km-eyebrow mb-4 text-xs font-semibold">{eyebrow}</p>
              ) : null}
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-[var(--on-surface)] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--on-surface-variant)] sm:text-lg">
                {description}
              </p>
              {actions ? (
                <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
              ) : null}
            </div>
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}
