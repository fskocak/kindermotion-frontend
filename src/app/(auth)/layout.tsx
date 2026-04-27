import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthGuard mode="guest">{children}</AuthGuard>;
}
