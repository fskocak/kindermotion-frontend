export const API_ROUTES = {
  auth: {
    adminLogin: "/auth/admin/login",
    teacherLogin: "/auth/teacher/login",
    me: "/auth/me",
  },
  admin: {
    teachers: "/admin/teachers",
    classes: "/admin/classes",
    logs: "/admin/logs",
    monitoringConfigs: "/admin/monitoring-configs",
  },
  teacher: {
    myClasses: "/teacher/classes/me",
    students: "/teacher/students",
    monitoringConfig: "/teacher/monitoring-config",
    alerts: "/teacher/alerts",
    recordings: "/teacher/recordings",
    mlJobs: "/teacher/recordings/ml-jobs",
    snapshots: "/teacher/snapshots",
  },
} as const;
