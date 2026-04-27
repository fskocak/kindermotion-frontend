import type { PaginatedResponse } from "@/types/api";

export type TeacherClass = {
  id: string;
  name: string;
  teacherId: string;
  createdAt: string;
};

export type TeacherStudentGender =
  | "MALE"
  | "FEMALE"
  | "OTHER"
  | "UNSPECIFIED";

export type TeacherStudent = {
  id: string;
  classId: string;
  // Keep new fields optional while backend and frontend roll out independently.
  studentId?: number | null;
  name?: string | null;
  surname?: string | null;
  fullName: string;
  dateOfBirth?: string | null;
  allergies: string | null;
  conditions: string | null;
  medications: string | null;
  medicalNotes: string | null;
  healthInfo?: string | null;
  age: number | null;
  gender?: TeacherStudentGender | null;
  className?: string | null;
  guardianName?: string | null;
  guardianContactPhone?: string | null;
  isActive?: boolean;
  level: string | null;
  imageUrl: string | null;
  dexterityScore: number;
  balanceScore: number;
  coordinationScore: number;
  createdAt: string;
  updatedAt: string;
};

export type TeacherStudentActivity = {
  id: string;
  date: string;
  score: number;
};

export type TeacherStudentMilestone = {
  id: string;
  title: string;
  description: string;
  iconName: string;
  variant: string;
  createdAt: string;
};

export type TeacherStudentProfileResponse = {
  student: TeacherStudent;
  activities: TeacherStudentActivity[];
  milestones: TeacherStudentMilestone[];
};

export type TeacherStudentMutationFields = {
  fullName: string;
  name?: string;
  surname?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: TeacherStudentGender;
  className?: string;
  healthInfo?: string;
  guardianName?: string;
  guardianContactPhone?: string;
  isActive?: boolean;
  allergies?: string;
  conditions?: string;
  medications?: string;
  medicalNotes?: string;
};

export type CreateTeacherStudentPayload = TeacherStudentMutationFields & {
  classId: string;
  studentId?: number;
};

export type UpdateTeacherStudentPayload = TeacherStudentMutationFields & {
  studentId?: number;
};

export type TeacherStudentListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type TeacherClassStudentsResponse = PaginatedResponse<TeacherStudent> & {
  class: TeacherClass;
};

export type TeacherMonitoringConfig = {
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

export type UpdateTeacherMonitoringConfigPayload = {
  isEnabled: boolean;
  distanceAlertsEnabled: boolean;
  motionSummaryEnabled: boolean;
  recordingEnabled: boolean;
  snapshotEnabled: boolean;
  proximityThresholdCm: number;
};

export type TeacherAlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "DISMISSED";

export type TeacherAlert = {
  id: string;
  classroomId: string;
  cameraId: string;
  severity: string;
  metricType: string;
  startedAt: string;
  endedAt: string;
  distanceScore: number | null;
  durationMs: number | null;
  status: TeacherAlertStatus;
  createdAt: string;
  updatedAt: string;
};

export type TeacherAlertsListParams = {
  status?: TeacherAlertStatus;
  limit?: number;
};

export type TeacherAlertAcknowledgeResponse = {
  id: string;
  status: TeacherAlertStatus;
  updatedAt: string;
};

export type TeacherRecordingAssetAccess = {
  previewUrl: string | null;
  downloadUrl: string | null;
  expiresAt: string | null;
};

export type TeacherRecordingSnapshot = {
  id: string;
  status: string;
  capturedAt: string;
  createdAt: string;
  access?: TeacherRecordingAssetAccess | null;
};

export type TeacherRecording = {
  id: string;
  classroomId: string;
  cameraId: string;
  status: string;
  startedAt: string;
  endedAt: string;
  durationMs: number | null;
  createdAt: string;
  updatedAt: string;
  assetStatus: string | null;
  access?: TeacherRecordingAssetAccess | null;
  snapshot?: TeacherRecordingSnapshot | null;
};

export type TeacherCameraRecordingResponse = {
  recording: {
    objectKey: string;
    mediaUrl: string;
    sizeBytes: number;
    sha256: string;
    durationMs: number;
  };
  publish: {
    published: boolean;
    eventId: string;
    eventType: string;
    backendStatusCode: number;
    backendResponse: {
      accepted?: boolean;
      processingResult?: string;
      status?: string;
      [key: string]: unknown;
    };
    targetUrl: string;
  };
};
