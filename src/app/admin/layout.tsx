import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="protected" requiredRole="ADMIN">
      <DashboardShell role="ADMIN">{children}</DashboardShell>
    </AuthGuard>
  );
}
