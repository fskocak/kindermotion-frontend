import { z } from "zod";

export const createTeacherSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export type CreateTeacherFormValues = z.infer<typeof createTeacherSchema>;
