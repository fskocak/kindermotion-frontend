import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandMark } from "@/components/common/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brand } from "@/theme/brand";
import { ThemeToggle } from "@/theme/theme-toggle";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="km-glass relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[calc(100vh-3rem)] lg:px-10 lg:py-12">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,_var(--hero-glow)_0%,_transparent_68%)]" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between gap-4">
              <BrandMark href={null} />
              <div className="flex items-center gap-3">
                <ThemeToggle showLabel={false} />
                <Badge>{brand.signature}</Badge>
              </div>
            </div>

            <div className="mt-12 max-w-xl">
              <p className="km-eyebrow mb-4 text-xs font-semibold">{eyebrow}</p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--on-surface)] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-5 text-base leading-7 text-[var(--on-surface-variant)] sm:text-lg">
                {description}
              </p>
            </div>

            <div className="mt-auto pt-12">
              <Button asChild variant="ghost" className="px-0">
                <Link href="/">
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  Back to home
                </Link>
              </Button>
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
