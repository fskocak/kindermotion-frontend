import { API_ROUTES } from "@/lib/constants/api-routes";
import { getPaginationQueryParams } from "@/lib/http/get-pagination-query-params";
import { httpClient } from "@/lib/http/http-client";
import type {
  CreateTeacherStudentPayload,
  TeacherAlert,
  TeacherAlertAcknowledgeResponse,
  TeacherAlertsListParams,
  TeacherClass,
  TeacherClassStudentsResponse,
  TeacherMonitoringConfig,
  TeacherRecordingAssetAccess,
  TeacherRecording,
  TeacherStudentListParams,
  TeacherStudent,
  UpdateTeacherStudentPayload,
  UpdateTeacherMonitoringConfigPayload,
  TeacherStudentProfileResponse,
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
  async getRecordings() {
    const response = await httpClient.get<TeacherRecording[]>(
      API_ROUTES.teacher.recordings,
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
};
