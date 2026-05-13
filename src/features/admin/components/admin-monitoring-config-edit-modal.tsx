"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { FormActions } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { Select } from "@/components/ui/select";
import {
  adminMonitoringConfigFormSchema,
  type AdminMonitoringConfigFormValues,
} from "@/features/admin/schemas/monitoring-config-form-schema";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { adminService } from "@/services";
import type {
  AdminClass,
  AdminMonitoringConfig,
  UpdateAdminMonitoringConfigPayload,
} from "@/types/admin";

type ToggleFieldName =
  | "isEnabled"
  | "distanceAlertsEnabled"
  | "motionSummaryEnabled"
  | "recordingEnabled";

type AdminMonitoringConfigEditModalProps = {
  open: boolean;
  monitoringConfig: AdminMonitoringConfig | null;
  classes: AdminClass[];
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

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
      className={`flex w-full items-center justify-between gap-4 rounded-[1.6rem] border px-4 py-4 text-left transition-all ${
        checked
          ? "border-[var(--primary)] bg-[var(--primary-soft)]"
          : "border-[var(--panel-border)] bg-[var(--surface-container-low)]"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div>
        <p className="text-sm font-semibold text-[var(--on-surface)]">{label}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--on-surface-variant)]">
          {description}
        </p>
      </div>

      <span
        className={`inline-flex h-8 min-w-16 items-center rounded-full px-1 ${
          checked
            ? "justify-end bg-[var(--primary)]"
            : "justify-start bg-[var(--surface-container-high)]"
        }`}
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-white text-[var(--primary)] shadow-sm">
          {checked ? <Check className="size-4" /> : null}
        </span>
      </span>
    </button>
  );
}

function mapConfigToFormValues(
  monitoringConfig: AdminMonitoringConfig,
): AdminMonitoringConfigFormValues {
  return {
    classroomId: monitoringConfig.classroomId,
    isEnabled: monitoringConfig.isEnabled,
    distanceAlertsEnabled: monitoringConfig.distanceAlertsEnabled,
    motionSummaryEnabled: monitoringConfig.motionSummaryEnabled,
    recordingEnabled: monitoringConfig.recordingEnabled,
    proximityThresholdCm: String(monitoringConfig.proximityThresholdCm),
  };
}

function mapFormValuesToPayload(
  values: AdminMonitoringConfigFormValues,
): UpdateAdminMonitoringConfigPayload {
  return {
    classroomId: values.classroomId,
    isEnabled: values.isEnabled,
    distanceAlertsEnabled: values.distanceAlertsEnabled,
    motionSummaryEnabled: values.motionSummaryEnabled,
    recordingEnabled: values.recordingEnabled,
    snapshotEnabled: true,
    proximityThresholdCm: Number(values.proximityThresholdCm),
  };
}

export function AdminMonitoringConfigEditModal({
  open,
  monitoringConfig,
  classes,
  onClose,
  onSuccess,
}: AdminMonitoringConfigEditModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const form = useForm<AdminMonitoringConfigFormValues>({
    resolver: zodResolver(adminMonitoringConfigFormSchema),
    defaultValues: {
      classroomId: monitoringConfig?.classroomId ?? "",
      isEnabled: monitoringConfig?.isEnabled ?? true,
      distanceAlertsEnabled: monitoringConfig?.distanceAlertsEnabled ?? true,
      motionSummaryEnabled: monitoringConfig?.motionSummaryEnabled ?? true,
      recordingEnabled: monitoringConfig?.recordingEnabled ?? true,
      proximityThresholdCm: String(
        monitoringConfig?.proximityThresholdCm ?? 150,
      ),
    },
  });

  useEffect(() => {
    if (!monitoringConfig) {
      return;
    }

    form.reset(mapConfigToFormValues(monitoringConfig));
  }, [form, monitoringConfig]);

  const toggleFields = useMemo(
    () => [
      {
        name: "isEnabled" as const,
        label: "System active",
        description: "Master switch for the classroom monitoring runtime.",
      },
      {
        name: "distanceAlertsEnabled" as const,
        label: "Distance alerts",
        description: "Enable proximity alert processing for this class.",
      },
      {
        name: "motionSummaryEnabled" as const,
        label: "Motion summary",
        description: "Enable classroom motion summary generation.",
      },
      {
        name: "recordingEnabled" as const,
        label: "Recording",
        description: "Accept recording completion events for this class.",
      },
    ],
    [],
  );

  function handleToggle(name: ToggleFieldName) {
    const currentValue = form.getValues(name);

    form.setValue(name, !currentValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: AdminMonitoringConfigFormValues) {
    if (!monitoringConfig) {
      return;
    }

    setFeedback(null);

    try {
      await adminService.updateMonitoringConfig(
        monitoringConfig.id,
        mapFormValuesToPayload(values),
      );
      await onSuccess();
      onClose();
    } catch (error) {
      setFeedback(getApiErrorMessage(error));
    }
  }

  const values = useWatch({
    control: form.control,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit monitoring config"
      description="Update classroom assignment, feature switches, and the runtime threshold."
      className="max-w-2xl"
    >
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="edit-monitoring-classroom">Classroom</Label>
          <Select
            id="edit-monitoring-classroom"
            disabled={form.formState.isSubmitting}
            {...form.register("classroomId")}
          >
            <option value="">Select a class</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
                {classItem.teacher ? ` · ${classItem.teacher.fullName}` : ""}
              </option>
            ))}
          </Select>
          {form.formState.errors.classroomId ? (
            <p className="text-sm text-[var(--error)]">
              {form.formState.errors.classroomId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3">
          {toggleFields.map((field) => (
            <MonitoringToggleCard
              key={field.name}
              label={field.label}
              description={field.description}
              checked={Boolean(values[field.name])}
              disabled={form.formState.isSubmitting}
              onToggle={() => handleToggle(field.name)}
            />
          ))}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="edit-monitoring-threshold">Proximity threshold (cm)</Label>
          <Input
            id="edit-monitoring-threshold"
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
          ) : null}
        </div>

        {feedback ? <MutationFeedback message={feedback} /> : null}

        <FormActions
          onCancel={onClose}
          submitLabel="Save changes"
          submittingLabel="Saving..."
          isSubmitting={form.formState.isSubmitting}
          isSubmitDisabled={classes.length === 0}
        />
      </form>
    </Modal>
  );
}
