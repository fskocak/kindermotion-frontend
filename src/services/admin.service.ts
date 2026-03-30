import { API_ROUTES } from "@/lib/constants/api-routes";
import { getPaginationQueryParams } from "@/lib/http/get-pagination-query-params";
import { httpClient } from "@/lib/http/http-client";
import type { PaginatedResponse } from "@/types/api";
import type {
  AdminClass,
  AdminClassListParams,
  AdminLog,
  AdminTeacher,
  AdminTeacherListParams,
  CreateClassPayload,
  CreateTeacherPayload,
  UpdateClassPayload,
  UpdateTeacherPayload,
} from "@/types/admin";

export const adminService = {
  async listTeachers(params: AdminTeacherListParams = {}) {
    const response = await httpClient.get<PaginatedResponse<AdminTeacher>>(
      API_ROUTES.admin.teachers,
      {
        params: {
          ...getPaginationQueryParams(params),
          search: params.search?.trim() ? params.search.trim() : undefined,
        },
      },
    );

    return response.data;
  },
  async createTeacher(payload: CreateTeacherPayload) {
    const response = await httpClient.post<AdminTeacher>(
      API_ROUTES.admin.teachers,
      payload,
    );

    return response.data;
  },
  async updateTeacher(teacherId: string, payload: UpdateTeacherPayload) {
    const response = await httpClient.patch<AdminTeacher>(
      `${API_ROUTES.admin.teachers}/${teacherId}`,
      payload,
    );

    return response.data;
  },
  async deleteTeacher(teacherId: string) {
    await httpClient.delete(`${API_ROUTES.admin.teachers}/${teacherId}`);
  },
  async listClasses(params: AdminClassListParams = {}) {
    const response = await httpClient.get<PaginatedResponse<AdminClass>>(
      API_ROUTES.admin.classes,
      {
        params: {
          ...getPaginationQueryParams(params),
          search: params.search?.trim() ? params.search.trim() : undefined,
          teacherId: params.teacherId || undefined,
        },
      },
    );

    return response.data;
  },
  async createClass(payload: CreateClassPayload) {
    const response = await httpClient.post<AdminClass>(
      API_ROUTES.admin.classes,
      payload,
    );

    return response.data;
  },
  async updateClass(classId: string, payload: UpdateClassPayload) {
    const response = await httpClient.patch<AdminClass>(
      `${API_ROUTES.admin.classes}/${classId}`,
      payload,
    );

    return response.data;
  },
  async deleteClass(classId: string) {
    await httpClient.delete(`${API_ROUTES.admin.classes}/${classId}`);
  },
  async listLogs() {
    const response = await httpClient.get<AdminLog[]>(API_ROUTES.admin.logs);

    return response.data;
  },
};
