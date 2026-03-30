import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="protected" requiredRole="TEACHER">
      <DashboardShell role="TEACHER">{children}</DashboardShell>
    </AuthGuard>
  );
}
