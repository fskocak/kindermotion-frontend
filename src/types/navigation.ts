import type { LucideIcon } from "lucide-react";

import type { UserRole } from "@/types/auth";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardNavConfig = Record<UserRole, readonly DashboardNavItem[]>;
