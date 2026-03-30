import type { PaginatedResponse } from "@/types/api";

export type TeacherClass = {
  id: string;
  name: string;
  teacherId: string;
  createdAt: string;
};

export type TeacherStudent = {
  id: string;
  classId: string;
  fullName: string;
  allergies: string | null;
  conditions: string | null;
  medications: string | null;
  medicalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeacherStudentPayload = {
  classId: string;
  fullName: string;
  allergies?: string;
  conditions?: string;
  medications?: string;
  medicalNotes?: string;
};

export type UpdateTeacherStudentPayload = {
  fullName: string;
  allergies?: string;
  conditions?: string;
  medications?: string;
  medicalNotes?: string;
};

export type TeacherStudentListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type TeacherClassStudentsResponse = PaginatedResponse<TeacherStudent> & {
  class: TeacherClass;
};
