export const APP_ROUTES = {
  home: "/",
  adminLogin: "/admin-login",
  teacherLogin: "/teacher-login",
  admin: "/admin",
  adminTeachers: "/admin/teachers",
  adminClasses: "/admin/classes",
  adminLogs: "/admin/logs",
  adminMonitoringConfigs: "/admin/monitoring-configs",
  teacher: "/teacher",
  teacherProfile: "/teacher/profile",
  teacherClasses: "/teacher/classes",
  teacherMonitoringConfig: "/teacher/monitoring-config",
  teacherAlerts: "/teacher/alerts",
  teacherRecordings: "/teacher/recordings",
} as const;

export function getTeacherClassRoute(classId: string) {
  return `${APP_ROUTES.teacherClasses}/${classId}`;
}
