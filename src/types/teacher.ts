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
