import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandMark } from "@/components/common/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brand } from "@/theme/brand";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: readonly string[];
  children: ReactNode;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  highlights,
  children,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="km-glass relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[calc(100vh-3rem)] lg:px-10 lg:py-12">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.18)_0%,_transparent_68%)]" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between gap-4">
              <BrandMark />
              <Badge>{brand.signature}</Badge>
            </div>

            <div className="mt-12 max-w-xl">
              <p className="km-eyebrow mb-4 text-xs font-semibold">{eyebrow}</p>
              <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[var(--on-surface)] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 text-base leading-7 text-[var(--on-surface-variant)] sm:text-lg">
                {description}
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-[1.75rem] bg-white/72 p-5 text-sm leading-6 text-[var(--on-surface-variant)] shadow-[0_16px_32px_rgba(25,28,30,0.04)]"
                >
                  {highlight}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-10">
              <div className="rounded-[1.75rem] bg-[var(--surface-container-lowest)] p-5 shadow-[0_16px_32px_rgba(25,28,30,0.04)]">
                <p className="km-eyebrow mb-3 text-xs font-semibold">
                  Shared Theme
                </p>
                <p className="text-sm leading-6 text-[var(--on-surface-variant)]">
                  {brand.description}
                </p>
                <Button asChild variant="ghost" className="mt-4 px-0">
                  <Link href="/">
                    Back to home
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center lg:min-h-[calc(100vh-3rem)]">
          <div className="w-full max-w-xl">{children}</div>
        </section>
      </div>
    </div>
  );
}
