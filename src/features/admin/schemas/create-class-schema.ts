import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().trim().min(2, "Class name must be at least 2 characters."),
  teacherId: z.string().min(1, "Teacher selection is required."),
});

export type CreateClassFormValues = z.infer<typeof createClassSchema>;
