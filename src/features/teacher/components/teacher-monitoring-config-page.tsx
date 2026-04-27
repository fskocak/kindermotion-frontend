"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";

import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { useToast } from "@/components/providers/toast-provider";
import {
  teacherMonitoringConfigSchema,
  type TeacherMonitoringConfigFormValues,
} from "@/features/teacher/schemas/monitoring-config-schema";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type {
  TeacherMonitoringConfig,
  UpdateTeacherMonitoringConfigPayload,
} from "@/types/teacher";

type ToggleFieldName =
  | "isEnabled"
  | "distanceAlertsEnabled"
  | "motionSummaryEnabled"
  | "recordingEnabled"
  | "snapshotEnabled";

type MonitoringToggleCardProps = {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

function MonitoringToggleCard({
  label,
  description,
  checked,
  disabled = false,
  onToggle,
}: MonitoringToggleCardProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={`flex w-full items-center justify-between gap-4 rounded-[1.75rem] border px-5 py-4 text-left transition-all ${
        checked
          ? "border-[var(--primary)] bg-[var(--primary-soft)]"
          : "border-[var(--panel-border)] bg-[var(--surface-container-low)]"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div>
        <p className="text-base font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
          {label}
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--on-surface-variant)]">
          {description}
        </p>
      </div>

      <span
        className={`inline-flex h-8 min-w-16 items-center rounded-full px-1 transition-colors ${
          checked
            ? "justify-end bg-[var(--brand-primary)]"
            : "justify-start bg-[var(--surface-container-high)]"
        }`}
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-white text-[var(--brand-primary)] shadow-sm">
          {checked ? <Check className="size-4" /> : null}
        </span>
      </span>
    </button>
  );
}

function mapConfigToFormValues(
  config: TeacherMonitoringConfig,
): TeacherMonitoringConfigFormValues {
  return {
    isEnabled: config.isEnabled,
    distanceAlertsEnabled: config.distanceAlertsEnabled,
    motionSummaryEnabled: config.motionSummaryEnabled,
    recordingEnabled: config.recordingEnabled,
    snapshotEnabled: config.snapshotEnabled,
    proximityThresholdCm: String(config.proximityThresholdCm),
  };
}

function mapFormValuesToPayload(
  values: TeacherMonitoringConfigFormValues,
): UpdateTeacherMonitoringConfigPayload {
  return {
    isEnabled: values.isEnabled,
    distanceAlertsEnabled: values.distanceAlertsEnabled,
    motionSummaryEnabled: values.motionSummaryEnabled,
    recordingEnabled: values.recordingEnabled,
    snapshotEnabled: values.snapshotEnabled,
    proximityThresholdCm: Number(values.proximityThresholdCm),
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type MonitoringFlagSummary = {
  label: string;
  enabled: boolean;
};

export function TeacherMonitoringConfigPageContent() {
  const toast = useToast();
  const [config, setConfig] = useState<TeacherMonitoringConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<TeacherMonitoringConfigFormValues>({
    resolver: zodResolver(teacherMonitoringConfigSchema),
    defaultValues: {
      isEnabled: false,
      distanceAlertsEnabled: false,
      motionSummaryEnabled: false,
      recordingEnabled: false,
      snapshotEnabled: false,
      proximityThresholdCm: "150",
    },
  });

  const loadMonitoringConfig = useCallback(async () => {
    try {
      setLoadError(null);

      const response = await teacherService.getMonitoringConfig();
      setConfig(response);
      form.reset(mapConfigToFormValues(response));
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void loadMonitoringConfig();
  }, [loadMonitoringConfig]);

  const toggleFields: Array<{
    name: ToggleFieldName;
    label: string;
    description: string;
  }> = [
    {
      name: "isEnabled",
      label: "System active",
      description: "Master switch for teacher-scoped monitoring in this classroom.",
    },
    {
      name: "distanceAlertsEnabled",
      label: "Distance alerts",
      description: "Allow proximity alert candidates to be processed and surfaced.",
    },
    {
      name: "motionSummaryEnabled",
      label: "Motion summary",
      description: "Enable periodic motion summary generation for the classroom.",
    },
    {
      name: "recordingEnabled",
      label: "Recording",
      description: "Allow recording completion events to be accepted for this source.",
    },
    {
      name: "snapshotEnabled",
      label: "Snapshot",
      description: "Allow snapshot-ready events to be accepted and persisted.",
    },
  ];

  function handleToggle(name: ToggleFieldName) {
    const currentValue = form.getValues(name);

    form.setValue(name, !currentValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: TeacherMonitoringConfigFormValues) {
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const response = await teacherService.updateMonitoringConfig(
        mapFormValuesToPayload(values),
      );

      setConfig(response);
      form.reset(mapConfigToFormValues(response));
      setSuccessMessage("Monitoring configuration saved successfully.");
      toast.success("Monitoring configuration saved.");
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  if (isLoading) {
    return (
      <DashboardPage
        eyebrow="Teacher / Monitoring Config"
        title="Monitoring Config"
        description="Control how your classroom monitoring pipeline behaves."
      >
        <DashboardLoadingState label="Loading monitoring configuration..." />
      </DashboardPage>
    );
  }

  if (loadError || !config) {
    return (
      <DashboardPage
        eyebrow="Teacher / Monitoring Config"
        title="Monitoring Config"
        description="Control how your classroom monitoring pipeline behaves."
      >
        <DashboardErrorState
          title="Could not load monitoring configuration"
          description={loadError || "An unexpected error occurred."}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                void loadMonitoringConfig();
              }}
            >
              Retry
            </Button>
          }
        />
      </DashboardPage>
    );
  }

  const values = form.watch();
  const currentFlags: MonitoringFlagSummary[] = [
    { label: "System active", enabled: config.isEnabled },
    { label: "Distance alerts", enabled: config.distanceAlertsEnabled },
    { label: "Motion summary", enabled: config.motionSummaryEnabled },
    { label: "Recording", enabled: config.recordingEnabled },
    { label: "Snapshot", enabled: config.snapshotEnabled },
  ];

  return (
    <DashboardPage
      eyebrow="Teacher / Monitoring Config"
      title="Monitoring Config"
      description="Backend values stay authoritative. Changes are saved only after the teacher-scoped PATCH request succeeds."
    >
      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <DashboardSectionCard
          eyebrow="Controls"
          title="Feature switches"
          description="Toggle the classroom-level monitoring capabilities that training-service consumes from the backend runtime config."
          actions={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                void loadMonitoringConfig();
              }}
              disabled={form.formState.isSubmitting}
            >
              Refresh
            </Button>
          }
        >
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((values) => void onSubmit(values))}
          >
            <div className="grid gap-4">
              {toggleFields.map((field) => (
                <MonitoringToggleCard
                  key={field.name}
                  label={field.label}
                  description={field.description}
                  checked={values[field.name]}
                  disabled={form.formState.isSubmitting}
                  onToggle={() => handleToggle(field.name)}
                />
              ))}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="proximity-threshold">Proximity threshold (cm)</Label>
              <Input
                id="proximity-threshold"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                disabled={form.formState.isSubmitting}
                {...form.register("proximityThresholdCm")}
              />
              {form.formState.errors.proximityThresholdCm ? (
                <p className="text-sm text-[var(--error)]">
                  {form.formState.errors.proximityThresholdCm.message}
                </p>
              ) : (
                <p className="text-sm leading-6 text-[var(--on-surface-variant)]">
                  Runtime config publishes this threshold to training-service as the
                  current proximity baseline.
                </p>
              )}
            </div>

            {submitError ? (
              <MutationFeedback message={submitError} />
            ) : successMessage ? (
              <MutationFeedback message={successMessage} variant="neutral" />
            ) : null}

            <FormActions
              submitLabel="Save changes"
              submittingLabel="Saving changes..."
              isSubmitting={form.formState.isSubmitting}
              isSubmitDisabled={!form.formState.isDirty}
            />
          </form>
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Runtime View"
          title="Backend snapshot"
          description="These details reflect the last response returned from the teacher monitoring config API."
        >
          <div className="grid gap-4">
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
              <p className="km-eyebrow mb-2 text-xs font-semibold">Classroom</p>
              <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
                {config.classroomId}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
                <p className="km-eyebrow mb-2 text-xs font-semibold">Last Updated</p>
                <p className="text-base font-semibold text-[var(--on-surface)]">
                  {formatDateTime(config.updatedAt)}
                </p>
              </div>

              <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
                <p className="km-eyebrow mb-2 text-xs font-semibold">Threshold</p>
                <p className="text-base font-semibold text-[var(--on-surface)]">
                  {config.proximityThresholdCm} cm
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
              <p className="km-eyebrow mb-3 text-xs font-semibold">Current flags</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {currentFlags.map(({ label, enabled }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[1.25rem] bg-[var(--surface-container-lowest)] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-[var(--on-surface)]">
                      {label}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        enabled
                          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
                      }`}
                    >
                      {enabled ? "ON" : "OFF"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5 text-sm leading-6 text-[var(--on-surface-variant)]">
              Save requests stay non-optimistic. The panel resets itself from the
              backend response after each successful PATCH so the frontend never
              becomes the source of truth.
            </div>
          </div>
        </DashboardSectionCard>
      </div>
    </DashboardPage>
  );
}
