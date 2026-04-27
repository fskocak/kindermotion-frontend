"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { Select } from "@/components/ui/select";
import { AdminMonitoringConfigCard } from "@/features/admin/components/admin-monitoring-config-card";
import { AdminMonitoringConfigEditModal } from "@/features/admin/components/admin-monitoring-config-edit-modal";
import {
  adminMonitoringConfigFormSchema,
  type AdminMonitoringConfigFormValues,
} from "@/features/admin/schemas/monitoring-config-form-schema";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { adminService } from "@/services";
import type {
  AdminClass,
  AdminMonitoringConfig,
  CreateAdminMonitoringConfigPayload,
} from "@/types/admin";

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

function mapFormValuesToPayload(
  values: AdminMonitoringConfigFormValues,
): CreateAdminMonitoringConfigPayload {
  return {
    classroomId: values.classroomId,
    isEnabled: values.isEnabled,
    distanceAlertsEnabled: values.distanceAlertsEnabled,
    motionSummaryEnabled: values.motionSummaryEnabled,
    recordingEnabled: values.recordingEnabled,
    snapshotEnabled: values.snapshotEnabled,
    proximityThresholdCm: Number(values.proximityThresholdCm),
  };
}

function getClassroomLabel(classItem: AdminClass | undefined) {
  if (!classItem) {
    return "Unresolved classroom";
  }

  return classItem.name;
}

function getTeacherLabel(classItem: AdminClass | undefined) {
  if (!classItem?.teacher) {
    return classItem ? classItem.teacherId : "Teacher not available";
  }

  return `${classItem.teacher.fullName} · ${classItem.teacher.email}`;
}

export function AdminMonitoringConfigsPageContent() {
  const toast = useToast();
  const [configs, setConfigs] = useState<AdminMonitoringConfig[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedConfig, setSelectedConfig] =
    useState<AdminMonitoringConfig | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const form = useForm<AdminMonitoringConfigFormValues>({
    resolver: zodResolver(adminMonitoringConfigFormSchema),
    defaultValues: {
      classroomId: "",
      isEnabled: true,
      distanceAlertsEnabled: true,
      motionSummaryEnabled: true,
      recordingEnabled: true,
      snapshotEnabled: true,
      proximityThresholdCm: "150",
    },
  });

  const toggleFields = useMemo(
    () => [
      {
        name: "isEnabled" as const,
        label: "System active",
        description: "Master switch for whether monitoring runs at all.",
      },
      {
        name: "distanceAlertsEnabled" as const,
        label: "Distance alerts",
        description: "Allow distance alert events for the selected class.",
      },
      {
        name: "motionSummaryEnabled" as const,
        label: "Motion summary",
        description: "Allow motion summary events and runtime generation.",
      },
      {
        name: "recordingEnabled" as const,
        label: "Recording",
        description: "Allow recording completion events to be persisted.",
      },
      {
        name: "snapshotEnabled" as const,
        label: "Snapshot",
        description: "Allow snapshot-ready events to be accepted.",
      },
    ],
    [],
  );

  const configuredClassIds = new Set(configs.map((config) => config.classroomId));
  const availableClasses = classes.filter(
    (classItem) => !configuredClassIds.has(classItem.id),
  );

  async function loadPageData() {
    try {
      setListError(null);

      const [configsData, classesData] = await Promise.all([
        adminService.listMonitoringConfigs(),
        adminService.listClasses({
          page: 1,
          limit: 100,
        }),
      ]);

      setConfigs(configsData);
      setClasses(classesData.items);
    } catch (error) {
      setListError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPageData();
  }, []);

  function handleToggle(name: ToggleFieldName) {
    const currentValue = form.getValues(name);

    form.setValue(name, !currentValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: AdminMonitoringConfigFormValues) {
    setSubmitError(null);

    try {
      await adminService.createMonitoringConfig(mapFormValuesToPayload(values));
      toast.success("Monitoring config created.");
      form.reset({
        classroomId: "",
        isEnabled: true,
        distanceAlertsEnabled: true,
        motionSummaryEnabled: true,
        recordingEnabled: true,
        snapshotEnabled: true,
        proximityThresholdCm: "150",
      });
      await loadPageData();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  async function handleEditSuccess() {
    toast.success("Monitoring config updated.");
    await loadPageData();
  }

  const values = form.watch();

  return (
    <DashboardPage
      eyebrow="Admin / Monitoring Configs"
      title="Shape classroom monitoring behavior from one control plane."
      description="These settings feed the backend runtime config that training-service consumes. Save changes carefully and let backend responses stay authoritative."
    >
      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <DashboardSectionCard
          eyebrow="Runtime Policies"
          title="Classroom monitoring configs"
          description="Review and edit the active monitoring policy per classroom."
          actions={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                void loadPageData();
              }}
            >
              Refresh
            </Button>
          }
        >
          {isLoading ? (
            <DashboardLoadingState label="Loading monitoring configs..." />
          ) : listError ? (
            <DashboardErrorState
              title="Could not load monitoring configs"
              description={listError}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    void loadPageData();
                  }}
                >
                  Retry
                </Button>
              }
            />
          ) : configs.length === 0 ? (
            <DashboardEmptyState
              title="No monitoring configs yet"
              description="Create the first classroom runtime policy from the form on the right. Once saved, teacher and training-service flows can consume it."
            />
          ) : (
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
                Showing {configs.length} monitoring config
                {configs.length === 1 ? "" : "s"} across the current class set.
              </div>

              {configs.map((monitoringConfig) => {
                const classItem = classes.find(
                  (candidate) => candidate.id === monitoringConfig.classroomId,
                );

                return (
                  <AdminMonitoringConfigCard
                    key={monitoringConfig.id}
                    monitoringConfig={monitoringConfig}
                    classNameLabel={getClassroomLabel(classItem)}
                    teacherLabel={getTeacherLabel(classItem)}
                    onEdit={(selectedMonitoringConfig) => {
                      setSelectedConfig(selectedMonitoringConfig);
                      setEditModalOpen(true);
                    }}
                  />
                );
              })}
            </div>
          )}
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Create Policy"
          title="Add monitoring config"
          description="Pick a class, tune the feature flags, and set the proximity threshold that runtime clients should consume."
          actions={
            <div className="rounded-full bg-[var(--surface-container-low)] p-2 text-[var(--on-surface-variant)]">
              <Settings2 className="size-4" />
            </div>
          }
        >
          <form
            className="grid gap-5"
            onSubmit={form.handleSubmit((values) => void onSubmit(values))}
          >
            <div className="grid gap-2">
              <Label htmlFor="monitoring-classroom">Classroom</Label>
              <Select
                id="monitoring-classroom"
                disabled={form.formState.isSubmitting || availableClasses.length === 0}
                {...form.register("classroomId")}
              >
                <option value="">Select a class</option>
                {availableClasses.map((classItem) => (
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
              ) : (
                <p className="text-sm leading-6 text-[var(--on-surface-variant)]">
                  Only classes without an existing monitoring config are shown here.
                </p>
              )}
            </div>

            <div className="grid gap-3">
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
              <Label htmlFor="monitoring-threshold">Proximity threshold (cm)</Label>
              <Input
                id="monitoring-threshold"
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

            {submitError ? <MutationFeedback message={submitError} /> : null}

            {availableClasses.length === 0 ? (
              <MutationFeedback
                variant="neutral"
                message="Every loaded class already has a monitoring config. Edit an existing policy instead of creating a duplicate."
              />
            ) : null}

            <FormActions
              submitLabel="Create config"
              submittingLabel="Creating..."
              isSubmitting={form.formState.isSubmitting}
              isSubmitDisabled={availableClasses.length === 0}
            />
          </form>
        </DashboardSectionCard>
      </div>

      <AdminMonitoringConfigEditModal
        open={editModalOpen}
        monitoringConfig={selectedConfig}
        classes={classes}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedConfig(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </DashboardPage>
  );
}
