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
  },
  teacher: {
    myClasses: "/teacher/classes/me",
    students: "/teacher/students",
  },
} as const;
