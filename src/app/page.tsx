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
      title="KinderMotion Management Portal"
      description="Access your workspace to manage classes, teachers, and student rosters securely."
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
            <p className="km-eyebrow text-xs font-semibold">Welcome</p>
            <CardTitle>Everything you need in one place.</CardTitle>
            <CardDescription>
              Manage operations, track classes, and stay organized with our unified
              platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
              <ShieldCheck className="mb-4 size-5 text-[var(--primary)]" />
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
                Secure access
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                Role-based access ensures data privacy and clean separation of duties.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
              <Users className="mb-4 size-5 text-[var(--secondary)]" />
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
                Connected teams
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                A central platform where admins and teachers collaborate continuously.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem]">
          <CardHeader>
            <p className="km-eyebrow text-xs font-semibold">Getting Started</p>
            <CardTitle>Choose your workspace</CardTitle>
            <CardDescription>
              Select your role to view your personalized dashboard and tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-6 text-[var(--on-surface-variant)]">
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3">
              1. Select Admin or Teacher login.
            </div>
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3">
              2. Enter your secure credentials.
            </div>
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3">
              3. Access your designated tools.
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
