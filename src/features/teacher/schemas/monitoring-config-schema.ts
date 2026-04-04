import { z } from "zod";

export const teacherMonitoringConfigSchema = z.object({
  isEnabled: z.boolean(),
  distanceAlertsEnabled: z.boolean(),
  motionSummaryEnabled: z.boolean(),
  recordingEnabled: z.boolean(),
  snapshotEnabled: z.boolean(),
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

export type TeacherMonitoringConfigFormValues = z.infer<
  typeof teacherMonitoringConfigSchema
>;
