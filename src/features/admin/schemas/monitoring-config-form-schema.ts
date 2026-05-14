import { z } from "zod";

export const adminMonitoringConfigFormSchema = z.object({
  classroomId: z.string().min(1, "Class selection is required."),
  isEnabled: z.boolean(),
  distanceAlertsEnabled: z.boolean(),
  motionSummaryEnabled: z.boolean(),
  recordingEnabled: z.boolean(),
  proximityThresholdCm: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), {
      message: "Threshold must be a whole number.",
    })
    .refine((value) => Number(value) > 0, {
      message: "Threshold must be greater than zero.",
    }),
});

export type AdminMonitoringConfigFormValues = z.infer<
  typeof adminMonitoringConfigFormSchema
>;
