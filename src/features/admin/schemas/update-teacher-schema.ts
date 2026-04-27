import { z } from "zod";

export const updateTeacherSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
});

export type UpdateTeacherFormValues = z.infer<typeof updateTeacherSchema>;
