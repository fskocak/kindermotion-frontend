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
    <div className="min-h-screen px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="mx-auto grid max-w-[1720px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-5">
        <DashboardSidebar items={navItems} pathname={pathname} />

        <div className="flex min-w-0 flex-col gap-5">
          <DashboardHeader role={role} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
