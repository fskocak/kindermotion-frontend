import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Users,
} from "lucide-react";

import { APP_ROUTES } from "@/lib/constants/routes";
import type { DashboardNavConfig } from "@/types/navigation";

export const DASHBOARD_NAV_ITEMS: DashboardNavConfig = {
  ADMIN: [
    {
      label: "Dashboard",
      href: APP_ROUTES.admin,
      icon: LayoutDashboard,
    },
    {
      label: "Teachers",
      href: APP_ROUTES.adminTeachers,
      icon: Users,
    },
    {
      label: "Classes",
      href: APP_ROUTES.adminClasses,
      icon: BookOpen,
    },
    {
      label: "Logs",
      href: APP_ROUTES.adminLogs,
      icon: ClipboardList,
    },
  ],
  TEACHER: [
    {
      label: "Dashboard",
      href: APP_ROUTES.teacher,
      icon: LayoutDashboard,
    },
    {
      label: "My Classes",
      href: APP_ROUTES.teacherClasses,
      icon: BookOpen,
    },
  ],
} as const;
