import {
  BookOpen,
  BellRing,
  Clapperboard,
  ClipboardList,
  LayoutDashboard,
  SlidersHorizontal,
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
    {
      label: "Monitoring Configs",
      href: APP_ROUTES.adminMonitoringConfigs,
      icon: SlidersHorizontal,
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
    {
      label: "Child Profiles",
      href: "/teacher/child-profiles",
      icon: Users,
    },
    {
      label: "Monitoring Config",
      href: APP_ROUTES.teacherMonitoringConfig,
      icon: SlidersHorizontal,
    },
    {
      label: "Alerts",
      href: APP_ROUTES.teacherAlerts,
      icon: BellRing,
    },
    {
      label: "Recordings",
      href: APP_ROUTES.teacherRecordings,
      icon: Clapperboard,
    },
  ],
} as const;
