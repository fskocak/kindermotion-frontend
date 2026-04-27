import type { TeacherStudent, TeacherStudentGender } from "@/types/teacher";
import type { TeacherStudentFormValues } from "@/features/teacher/schemas/student-form-schema";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export function splitTeacherStudentFullName(fullName: string) {
  const trimmedName = fullName.trim();

  if (!trimmedName) {
    return {
      name: "",
      surname: "",
    };
  }

  const [name = "", ...surnameParts] = trimmedName.split(/\s+/);

  return {
    name,
    surname: surnameParts.join(" "),
  };
}

export function buildTeacherStudentFullName(
  name: string,
  surname: string,
  fallbackFullName = "",
) {
  const fullName = [name.trim(), surname.trim()].filter(Boolean).join(" ");

  return fullName || fallbackFullName.trim() || "Unnamed student";
}

export function getTeacherStudentDisplayName(student: TeacherStudent) {
  return buildTeacherStudentFullName(
    student.name ?? "",
    student.surname ?? "",
    student.fullName,
  );
}

export function getTeacherStudentGenderLabel(
  gender: TeacherStudentGender | null | undefined,
) {
  switch (gender) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    case "OTHER":
      return "Other";
    case "UNSPECIFIED":
      return "Unspecified";
    default:
      return null;
  }
}

export function getTeacherStudentStatusLabel(isActive: boolean | undefined) {
  return isActive === false ? "Inactive" : "Active";
}

export function formatTeacherStudentDate(value: string | null | undefined) {
  if (!value || value.trim().length === 0) {
    return null;
  }

  return dateFormatter.format(new Date(value));
}

export function getTeacherStudentAge(student: TeacherStudent) {
  if (typeof student.age === "number") {
    return student.age;
  }

  if (!student.dateOfBirth) {
    return null;
  }

  const today = new Date();
  const birthDate = new Date(student.dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function buildTeacherStudentFormValues(
  student: TeacherStudent | null,
): TeacherStudentFormValues {
  const fallbackNameParts = splitTeacherStudentFullName(student?.fullName ?? "");

  return {
    studentId:
      typeof student?.studentId === "number" ? String(student.studentId) : "",
    name: student?.name ?? fallbackNameParts.name,
    surname: student?.surname ?? fallbackNameParts.surname,
    dateOfBirth: student?.dateOfBirth?.slice(0, 10) ?? "",
    age: typeof student?.age === "number" ? String(student.age) : "",
    gender: student?.gender ?? "UNSPECIFIED",
    healthInfo: student?.healthInfo ?? "",
    guardianName: student?.guardianName ?? "",
    guardianContactPhone: student?.guardianContactPhone ?? "",
    isActive: student?.isActive === false ? "INACTIVE" : "ACTIVE",
    allergies: student?.allergies ?? "",
    conditions: student?.conditions ?? "",
    medications: student?.medications ?? "",
    medicalNotes: student?.medicalNotes ?? "",
  };
}

export function buildTeacherStudentMutationPayload(
  values: TeacherStudentFormValues,
) {
  return {
    studentId: values.studentId.trim() ? Number(values.studentId) : undefined,
    fullName: buildTeacherStudentFullName(values.name, values.surname),
    name: values.name.trim(),
    surname: values.surname.trim(),
    dateOfBirth: values.dateOfBirth.trim() || undefined,
    age: values.age.trim() ? Number(values.age) : undefined,
    gender: values.gender,
    healthInfo: values.healthInfo.trim(),
    guardianName: values.guardianName.trim(),
    guardianContactPhone: values.guardianContactPhone.trim(),
    isActive: values.isActive === 'ACTIVE',
    allergies: values.allergies.trim(),
    conditions: values.conditions.trim(),
    medications: values.medications.trim(),
    medicalNotes: values.medicalNotes.trim(),
  };
}
