import Link from "next/link";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants/routes";

export default function Home() {
  return (
    <SiteShell
      eyebrow="Editorial Soft Minimalism"
      title="A shared theme and auth architecture are now in place for KinderMotion."
      description="The Premium Clarity design language from `stitch 2` has been translated into a reusable theme layer. Admin and teacher flows now run on the same component architecture, surface system, and auth store."
      actions={
        <>
          <Button asChild size="lg">
            <Link href={APP_ROUTES.adminLogin}>
              Go to admin login
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={APP_ROUTES.teacherLogin}>Go to teacher login</Link>
          </Button>
        </>
      }
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem]">
          <CardHeader>
            <p className="km-eyebrow text-xs font-semibold">Shared Architecture</p>
            <CardTitle>Everything now moves through one design language.</CardTitle>
            <CardDescription>
              The theme layer, shadcn-style primitives, auth service, and Zustand
              store are aligned around the same foundation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
              <ShieldCheck className="mb-4 size-5 text-[var(--primary)]" />
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
                Auth shell
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                Admin and teacher login pages share the same form flow and the
                same store.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
              <Users className="mb-4 size-5 text-[var(--secondary)]" />
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
                Shared theme
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                The Premium Clarity color, radius, and surface system is now
                centralized.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem]">
          <CardHeader>
            <p className="km-eyebrow text-xs font-semibold">Flow Summary</p>
            <CardTitle>Login flow</CardTitle>
            <CardDescription>
              After sign-in, the token is stored, `/auth/me` is called, and the
              user is redirected to the role-specific route.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-6 text-[var(--on-surface-variant)]">
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3">
              1. Form validation is handled with React Hook Form and Zod.
            </div>
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3">
              2. Requests move through the existing `authService`.
            </div>
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3">
              3. The Zustand store reads the token, restores the user, and switches
              the route.
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
