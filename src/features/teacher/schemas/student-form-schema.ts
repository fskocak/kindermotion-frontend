import { z } from "zod";

export const teacherStudentFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required.").max(120),
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
