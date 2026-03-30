"use client";

import { LogOut } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import type { UserRole } from "@/types/auth";

type DashboardHeaderProps = {
  role: UserRole;
};

const roleMeta = {
  ADMIN: {
    eyebrow: "Admin Workspace",
    title: "Operational control center",
  },
  TEACHER: {
    eyebrow: "Teacher Workspace",
    title: "Classroom management space",
  },
} as const;

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="km-glass flex flex-col gap-4 rounded-[2rem] px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="km-eyebrow mb-2 text-xs font-semibold">
          {roleMeta[role].eyebrow}
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--on-surface)] sm:text-3xl">
          {roleMeta[role].title}
        </h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="rounded-[1.6rem] bg-white/70 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
                Signed in
              </p>
              <p className="text-sm font-medium text-[var(--on-surface)]">
                {user?.email ?? "Unknown user"}
              </p>
            </div>
            <Badge variant="primary">{role}</Badge>
          </div>
        </div>

        <Button type="button" variant="outline" onClick={logout}>
          <LogOut />
          Logout
        </Button>
      </div>
    </header>
  );
}
