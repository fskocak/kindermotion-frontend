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
  reports: TeacherStudentReport[];
};

export type TeacherStudentReport = {
  jobId: string;
  runId: string | null;
  status: string;
  trackId: number;
  createdAt: string;
  updatedAt: string;
  recordingStartedAt: string;
  recordingEndedAt: string;
  reportAsset: TeacherRecordingAsset | null;
};

export type TeacherStudentReportMetric = {
  date: string;
  totalDurationSeconds: number;
  sittingSeconds: number;
  standingSeconds: number;
  walkingSeconds: number;
  handRaisedSeconds: number;
  clappingSeconds: number;
  handArmMovementSeconds: number;
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

export type TeacherRecordingsListParams = {
  classId?: string;
  date?: string;
  limit?: number;
};

export type TeacherRecordingAssetAccess = {
  previewUrl: string | null;
  downloadUrl: string | null;
  expiresAt: string | null;
};

export type TeacherRecordingAsset = {
  id: string;
  assetType: string;
  status: string;
  contentType: string | null;
};

export type TeacherMlTrackMapping = {
  id: string;
  trackId: number;
  studentId: string;
};

export type TeacherMlProcessingJob = {
  id: string;
  status: string;
  runId: string | null;
  trackIds: number[];
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  processedVideoAsset: TeacherRecordingAsset | null;
  reportAsset: TeacherRecordingAsset | null;
  predictionCsvAsset: TeacherRecordingAsset | null;
  mappings: TeacherMlTrackMapping[];
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
  mlJob?: TeacherMlProcessingJob | null;
};

export type TeacherCameraRecordingResponse = {
  recording: {
    recordingKey: string;
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

export type TeacherMlStoredArtifact = {
  objectKey: string;
  mediaUrl: string;
  sizeBytes: number;
  sha256: string;
  contentType: string;
  storageProvider: string;
  bucket: string | null;
};

export type TeacherMlRoiBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TeacherMlVideoInitResponse = {
  recording: TeacherCameraRecordingResponse["recording"];
  publish: TeacherCameraRecordingResponse["publish"];
  firstFrame: TeacherMlStoredArtifact;
  frameWidth: number;
  frameHeight: number;
};

export type TeacherMlVideoUploadResponse = {
  recording: TeacherCameraRecordingResponse["recording"];
  publish: TeacherCameraRecordingResponse["publish"];
  runId: string;
  status: string;
  trackIds: number[];
  artifacts: {
    processedVideo: TeacherMlStoredArtifact | null;
    reportPdf: TeacherMlStoredArtifact | null;
    predictionCsv: TeacherMlStoredArtifact | null;
  };
  errorMessage: string | null;
};

export type TeacherMlLiveSessionStartResponse = {
  sessionId: string;
  firstFrame: TeacherMlStoredArtifact;
  frameWidth: number;
  frameHeight: number;
};

export type TeacherMlLiveSessionChunkResponse = {
  sessionId: string;
  sequence: number;
  sizeBytes: number;
};

export type CreateTeacherMlProcessingJobPayload = {
  recordingKey: string;
  runId: string;
  status: string;
  trackIds: number[];
  artifacts: TeacherMlVideoUploadResponse["artifacts"];
  errorMessage?: string | null;
};

export type UpdateTeacherMlTrackMappingsPayload = {
  mappings: Array<{
    trackId: number;
    studentId: string;
  }>;
};
