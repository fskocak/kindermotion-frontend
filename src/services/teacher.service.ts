import { API_ROUTES } from "@/lib/constants/api-routes";
import { env } from "@/lib/config/env";
import { getPaginationQueryParams } from "@/lib/http/get-pagination-query-params";
import { httpClient } from "@/lib/http/http-client";
import type {
  CreateTeacherStudentPayload,
  TeacherAlert,
  TeacherAlertAcknowledgeResponse,
  TeacherAlertWatchPair,
  TeacherAlertsListParams,
  TeacherClass,
  TeacherClassStudentsResponse,
  TeacherMonitoringConfig,
  TeacherRecordingAssetAccess,
  TeacherCameraRecordingResponse,
  TeacherRecordingsResponse,
  TeacherRecordingsListParams,
  TeacherStudentListParams,
  TeacherStudent,
  UpdateTeacherStudentPayload,
  UpdateTeacherMonitoringConfigPayload,
  UpsertTeacherAlertWatchPairPayload,
  TeacherStudentProfileResponse,
  TeacherMlVideoInitResponse,
  TeacherMlVideoUploadResponse,
  TeacherMlLiveSessionChunkResponse,
  TeacherMlLiveSessionStartResponse,
  TeacherMlRoiBox,
  CreateTeacherMlProcessingJobPayload,
  TeacherMlProcessingJob,
  UpdateTeacherMlTrackMappingsPayload,
} from "@/types/teacher";

export const teacherService = {
  async listMyClasses() {
    const response = await httpClient.get<TeacherClass[]>(
      API_ROUTES.teacher.myClasses,
    );

    return response.data;
  },
  async getClassStudents(
    classId: string,
    params: TeacherStudentListParams = {},
  ) {
    const response = await httpClient.get<TeacherClassStudentsResponse>(
      `${API_ROUTES.teacher.students}/${classId}`,
      {
        params: {
          ...getPaginationQueryParams(params),
          search: params.search?.trim() ? params.search.trim() : undefined,
        },
      },
    );

    return response.data;
  },
  async createStudent(payload: CreateTeacherStudentPayload) {
    const response = await httpClient.post<TeacherStudent>(
      API_ROUTES.teacher.students,
      payload,
    );

    return response.data;
  },
  async updateStudent(studentId: string, payload: UpdateTeacherStudentPayload) {
    const response = await httpClient.patch<TeacherStudent>(
      `${API_ROUTES.teacher.students}/${studentId}`,
      payload,
    );

    return response.data;
  },
  async deleteStudent(studentId: string) {
    await httpClient.delete(`${API_ROUTES.teacher.students}/${studentId}`);
  },
  async getStudentProfile(studentId: string) {
    const response = await httpClient.get<TeacherStudentProfileResponse>(
      `${API_ROUTES.teacher.students}/${studentId}/profile`
    );
    return response.data;
  },
  async getStudentReportAccess(studentId: string, jobId: string) {
    const response = await httpClient.get<TeacherRecordingAssetAccess>(
      `${API_ROUTES.teacher.students}/${studentId}/reports/${jobId}/access`,
    );

    return response.data;
  },
  async getMonitoringConfig() {
    const response = await httpClient.get<TeacherMonitoringConfig>(
      API_ROUTES.teacher.monitoringConfig,
    );

    return response.data;
  },
  async updateMonitoringConfig(payload: UpdateTeacherMonitoringConfigPayload) {
    const response = await httpClient.patch<TeacherMonitoringConfig>(
      API_ROUTES.teacher.monitoringConfig,
      payload,
    );

    return response.data;
  },
  async getAlerts(params: TeacherAlertsListParams = {}) {
    const response = await httpClient.get<TeacherAlert[]>(
      API_ROUTES.teacher.alerts,
      {
        params: {
          status: params.status,
          limit: params.limit,
        },
      },
    );

    return response.data;
  },
  async acknowledgeAlert(id: string) {
    const response = await httpClient.patch<TeacherAlertAcknowledgeResponse>(
      `${API_ROUTES.teacher.alerts}/${id}/acknowledge`,
    );

    return response.data;
  },
  async getAlertWatchPair(classroomId: string) {
    const response = await httpClient.get<TeacherAlertWatchPair | null>(
      `${API_ROUTES.teacher.alertWatchPair}/${classroomId}`,
    );

    return response.data;
  },
  async upsertAlertWatchPair(payload: UpsertTeacherAlertWatchPairPayload) {
    const response = await httpClient.patch<TeacherAlertWatchPair>(
      API_ROUTES.teacher.alertWatchPair,
      payload,
    );

    return response.data;
  },
  async deleteAlertWatchPair(classroomId: string) {
    await httpClient.delete(`${API_ROUTES.teacher.alertWatchPair}/${classroomId}`);
  },
  async getRecordings(params: TeacherRecordingsListParams = {}) {
    const response = await httpClient.get<TeacherRecordingsResponse>(
      API_ROUTES.teacher.recordings,
      {
        params: {
          classId: params.classId,
          date: params.date,
          page: params.page,
          limit: params.limit,
        },
      },
    );

    return response.data;
  },
  async getRecordingAccess(id: string) {
    const response = await httpClient.get<TeacherRecordingAssetAccess>(
      `${API_ROUTES.teacher.recordings}/${id}/access`,
    );

    return response.data;
  },
  async getSnapshotAccess(id: string) {
    const response = await httpClient.get<TeacherRecordingAssetAccess>(
      `${API_ROUTES.teacher.snapshots}/${id}/access`,
    );

    return response.data;
  },
  async startCameraRecording(durationSeconds = 5) {
    const response = await httpClient.post<TeacherCameraRecordingResponse>(
      `${env.trainingApiBaseUrl}/camera/recording`,
      {
        durationSeconds,
      },
    );

    return response.data;
  },
  async uploadBrowserRecording({
    blob,
    startedAt,
    endedAt,
  }: {
    blob: Blob;
    startedAt: string;
    endedAt: string;
  }) {
    const formData = new FormData();
    formData.append("file", blob, "browser-recording.webm");
    formData.append("startedAt", startedAt);
    formData.append("endedAt", endedAt);

    const response = await httpClient.post<TeacherCameraRecordingResponse>(
      `${env.trainingApiBaseUrl}/camera/browser-recording`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
  async uploadMlVideoInit({
    file,
    startedAt,
    endedAt,
  }: {
    file: File;
    startedAt: string;
    endedAt: string;
  }) {
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("startedAt", startedAt);
    formData.append("endedAt", endedAt);
    formData.append("device", "cpu");

    const response = await httpClient.post<TeacherMlVideoInitResponse>(
      `${env.trainingApiBaseUrl}/camera/ml-upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 0,
      },
    );

    return response.data;
  },
  async processMlVideo({
    recordingKey,
    objectKey,
    rois,
    pairWatchTrackIds,
  }: {
    recordingKey: string;
    objectKey: string;
    rois: TeacherMlRoiBox[];
    pairWatchTrackIds?: number[];
  }) {
    const response = await httpClient.post<TeacherMlVideoUploadResponse>(
      `${env.trainingApiBaseUrl}/camera/ml-upload/process`,
      {
        recordingKey,
        objectKey,
        rois,
        pairWatchTrackIds,
      },
      {
        timeout: 0,
      },
    );

    return response.data;
  },
  async startLiveMlSession({ firstFrame }: { firstFrame: Blob }) {
    const formData = new FormData();
    formData.append("firstFrame", firstFrame, "first-frame.png");

    const response = await httpClient.post<TeacherMlLiveSessionStartResponse>(
      `${env.trainingApiBaseUrl}/camera/live-session/start`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 0,
      },
    );

    return response.data;
  },
  async uploadLiveMlChunk({
    sessionId,
    sequence,
    blob,
  }: {
    sessionId: string;
    sequence: number;
    blob: Blob;
  }) {
    const formData = new FormData();
    formData.append("file", blob, `chunk-${sequence}.webm`);
    formData.append("sequence", String(sequence));

    const response = await httpClient.post<TeacherMlLiveSessionChunkResponse>(
      `${env.trainingApiBaseUrl}/camera/live-session/${sessionId}/chunk`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 0,
      },
    );

    return response.data;
  },
  async configureLiveMlSession({
    sessionId,
    rois,
    pairWatchTrackIds,
  }: {
    sessionId: string;
    rois: TeacherMlRoiBox[];
    pairWatchTrackIds?: number[];
  }) {
    const response = await httpClient.post<{ success: boolean }>(
      `${env.trainingApiBaseUrl}/camera/live-session/${sessionId}/configure`,
      {
        rois,
        pairWatchTrackIds,
      },
      {
        timeout: 0,
      },
    );

    return response.data;
  },
  async finalizeLiveMlSession({
    sessionId,
    startedAt,
    endedAt,
    rois,
    pairWatchTrackIds,
  }: {
    sessionId: string;
    startedAt: string;
    endedAt: string;
    rois: TeacherMlRoiBox[];
    pairWatchTrackIds?: number[];
  }) {
    const response = await httpClient.post<TeacherMlVideoUploadResponse>(
      `${env.trainingApiBaseUrl}/camera/live-session/${sessionId}/finalize`,
      {
        startedAt,
        endedAt,
        rois,
        pairWatchTrackIds,
      },
      {
        timeout: 0,
      },
    );

    return response.data;
  },
  async createMlProcessingJob(payload: CreateTeacherMlProcessingJobPayload) {
    const normalizeArtifact = (
      artifact: CreateTeacherMlProcessingJobPayload["artifacts"]["processedVideo"],
    ) =>
      artifact
        ? {
            storageProvider: artifact.storageProvider,
            bucket: artifact.bucket,
            objectKey: artifact.objectKey,
            contentType: artifact.contentType,
            sizeBytes: artifact.sizeBytes,
            sha256: artifact.sha256,
          }
        : null;

    const response = await httpClient.post<TeacherMlProcessingJob>(
      API_ROUTES.teacher.mlJobs,
      {
        ...payload,
        artifacts: {
          processedVideo: normalizeArtifact(payload.artifacts.processedVideo),
          reportPdf: normalizeArtifact(payload.artifacts.reportPdf),
          predictionCsv: normalizeArtifact(payload.artifacts.predictionCsv),
        },
      },
    );

    return response.data;
  },
  async deleteRecording(recordingId: string) {
    const response = await httpClient.delete<{ success: boolean }>(
      `${API_ROUTES.teacher.recordings}/${recordingId}`,
    );

    return response.data;
  },
  async updateMlTrackMappings(
    jobId: string,
    payload: UpdateTeacherMlTrackMappingsPayload,
  ) {
    const response = await httpClient.patch<TeacherMlProcessingJob>(
      `${API_ROUTES.teacher.mlJobs}/${jobId}/mappings`,
      payload,
    );

    return response.data;
  },
  async getMlJobAssetAccess(
    jobId: string,
    kind: "processed-video" | "report-pdf" | "prediction-csv",
  ) {
    const response = await httpClient.get<TeacherRecordingAssetAccess>(
      `${API_ROUTES.teacher.mlJobs}/${jobId}/assets/${kind}/access`,
    );

    return response.data;
  },
};
