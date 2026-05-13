import { z } from "zod";

const teacherStudentGenderOptions = [
  "MALE",
  "FEMALE",
  "OTHER",
  "UNSPECIFIED",
] as const;

const teacherStudentStatusOptions = ["ACTIVE", "INACTIVE"] as const;

function optionalWholeNumberField(label: string) {
  return z.string().trim().refine((value) => value === "" || /^\d+$/.test(value), {
    message: `${label} must be a whole number.`,
  });
}

export const teacherStudentFormSchema = z.object({
  studentId: optionalWholeNumberField("Student ID"),
  name: z.string().trim().min(1, "Name is required.").max(60),
  surname: z.string().trim().min(1, "Surname is required.").max(60),
  dateOfBirth: z.string().trim().refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Enter a valid date of birth.",
  ).refine(
    (value) => value === "" || new Date(`${value}T00:00:00`).getTime() <= Date.now(),
    "Date of birth cannot be in the future.",
  ),
  age: optionalWholeNumberField("Age"),
  gender: z.enum(teacherStudentGenderOptions),
  healthInfo: z
    .string()
    .trim()
    .max(1000, "Health information must be 1000 characters or fewer."),
  guardianName: z
    .string()
    .trim()
    .max(120, "Guardian name must be 120 characters or fewer."),
  guardianContactPhone: z
    .string()
    .trim()
    .max(30, "Guardian contact phone must be 30 characters or fewer.")
    .refine(
      (value) => value === "" || /^[0-9()+\-\s]+$/.test(value),
      "Enter a valid guardian contact phone.",
    ),
  isActive: z.enum(teacherStudentStatusOptions),
  allergies: z
    .string()
    .trim()
    .max(500, "Allergies must be 500 characters or fewer."),
  conditions: z
    .string()
    .trim()
    .max(500, "Conditions must be 500 characters or fewer."),
  medications: z
    .string()
    .trim()
    .max(500, "Medications must be 500 characters or fewer."),
  medicalNotes: z
    .string()
    .trim()
    .max(1000, "Medical notes must be 1000 characters or fewer."),
});

export type TeacherStudentFormValues = z.infer<
  typeof teacherStudentFormSchema
>;
