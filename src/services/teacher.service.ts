import { API_ROUTES } from "@/lib/constants/api-routes";
import { getPaginationQueryParams } from "@/lib/http/get-pagination-query-params";
import { httpClient } from "@/lib/http/http-client";
import type {
  CreateTeacherStudentPayload,
  TeacherClass,
  TeacherClassStudentsResponse,
  TeacherStudentListParams,
  TeacherStudent,
  UpdateTeacherStudentPayload,
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
};
