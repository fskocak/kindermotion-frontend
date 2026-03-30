"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DASHBOARD_NAV_ITEMS } from "@/lib/navigation/dashboard-nav";
import type { UserRole } from "@/types/auth";

type DashboardShellProps = {
  role: UserRole;
  children: ReactNode;
};

export function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const navItems = DASHBOARD_NAV_ITEMS[role];

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <DashboardSidebar role={role} items={navItems} pathname={pathname} />

        <div className="flex min-w-0 flex-col gap-6">
          <DashboardHeader role={role} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
