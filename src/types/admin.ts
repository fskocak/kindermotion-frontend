export type AdminTeacher = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
};

export type CreateTeacherPayload = {
  email: string;
  fullName: string;
  password: string;
};

export type UpdateTeacherPayload = {
  email: string;
  fullName: string;
};

export type AdminTeacherListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type AdminClassTeacher = {
  id: string;
  email: string;
  fullName: string;
} | null;

export type AdminClass = {
  id: string;
  name: string;
  teacherId: string;
  createdAt: string;
  teacher: AdminClassTeacher;
};

export type CreateClassPayload = {
  name: string;
  teacherId: string;
};

export type UpdateClassPayload = {
  name: string;
  teacherId: string;
};

export type AdminClassListParams = {
  page?: number;
  limit?: number;
  search?: string;
  teacherId?: string;
};

export type AdminMonitoringConfig = {
  id: string;
  classroomId: string;
  isEnabled: boolean;
  distanceAlertsEnabled: boolean;
  motionSummaryEnabled: boolean;
  recordingEnabled: boolean;
  snapshotEnabled: boolean;
  proximityThresholdCm: number;
  updatedByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminMonitoringConfigPayload = {
  classroomId: string;
  isEnabled: boolean;
  distanceAlertsEnabled: boolean;
  motionSummaryEnabled: boolean;
  recordingEnabled: boolean;
  snapshotEnabled: boolean;
  proximityThresholdCm: number;
};

export type UpdateAdminMonitoringConfigPayload =
  CreateAdminMonitoringConfigPayload;

export type AdminLogAdmin = {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN";
} | null;

export type AdminLog = {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: Record<string, string> | string | null;
  createdAt: string;
  admin: AdminLogAdmin;
};
