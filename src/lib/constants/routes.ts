export const APP_ROUTES = {
  home: "/",
  adminLogin: "/admin-login",
  teacherLogin: "/teacher-login",
  admin: "/admin",
  adminTeachers: "/admin/teachers",
  adminClasses: "/admin/classes",
  adminLogs: "/admin/logs",
  teacher: "/teacher",
  teacherProfile: "/teacher/profile",
  teacherClasses: "/teacher/classes",
} as const;

export function getTeacherClassRoute(classId: string) {
  return `${APP_ROUTES.teacherClasses}/${classId}`;
}
