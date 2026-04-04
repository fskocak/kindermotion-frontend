"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, RefreshCcw } from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { formatDateTime } from "@/lib/format/date-time";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type { TeacherAlert, TeacherAlertStatus } from "@/types/teacher";

const ALERT_STATUS_OPTIONS = [
  { label: "All statuses", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Acknowledged", value: "ACKNOWLEDGED" },
  { label: "Dismissed", value: "DISMISSED" },
] as const;

const ALERT_LIMIT_OPTIONS = [
  { label: "10 alerts", value: 10 },
  { label: "20 alerts", value: 20 },
  { label: "50 alerts", value: 50 },
] as const;

type AlertStatusFilter = "ALL" | TeacherAlertStatus;

function getSeverityBadgeVariant(severity: string) {
  return severity.toUpperCase() === "HIGH" ? "primary" : "muted";
}

function getStatusTone(status: TeacherAlertStatus) {
  if (status === "ACTIVE") {
    return "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]";
  }

  if (status === "ACKNOWLEDGED") {
    return "border-[var(--outline)] bg-[var(--surface-container-low)] text-[var(--on-surface)]";
  }

  return "border-[var(--panel-border)] bg-[var(--surface-container)] text-[var(--on-surface-variant)]";
}

function formatDuration(durationMs: number | null) {
  if (durationMs === null) {
    return "N/A";
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
}

function formatDistanceScore(distanceScore: number | null) {
  if (distanceScore === null) {
    return "N/A";
  }

  return distanceScore.toFixed(2);
}

type AlertMetaItemProps = {
  label: string;
  value: string;
};

function AlertMetaItem({ label, value }: AlertMetaItemProps) {
  return (
    <div className="rounded-[1.25rem] bg-[var(--surface-container-low)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

type AlertCardProps = {
  alert: TeacherAlert;
  isAcknowledging: boolean;
  onAcknowledge: (alertId: string) => void;
};

function AlertCard({ alert, isAcknowledging, onAcknowledge }: AlertCardProps) {
  const isActive = alert.status === "ACTIVE";

  return (
    <article className="rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--surface-container-lowest)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getSeverityBadgeVariant(alert.severity)}>
              {alert.severity}
            </Badge>
            <div
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getStatusTone(alert.status)}`}
            >
              {alert.status}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
              {alert.metricType}
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--on-surface-variant)]">
              Alert created {formatDateTime(alert.createdAt)}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant={isActive ? "default" : "secondary"}
          size="sm"
          disabled={!isActive || isAcknowledging}
          onClick={() => onAcknowledge(alert.id)}
        >
          {isAcknowledging ? "Acknowledging..." : isActive ? "Acknowledge" : "Acknowledged"}
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AlertMetaItem label="Started At" value={formatDateTime(alert.startedAt)} />
        <AlertMetaItem label="Ended At" value={formatDateTime(alert.endedAt)} />
        <AlertMetaItem
          label="Duration"
          value={formatDuration(alert.durationMs)}
        />
        <AlertMetaItem
          label="Distance Score"
          value={formatDistanceScore(alert.distanceScore)}
        />
        <AlertMetaItem label="Camera" value={alert.cameraId} />
        <AlertMetaItem label="Updated" value={formatDateTime(alert.updatedAt)} />
      </div>
    </article>
  );
}

export function TeacherAlertsPageContent() {
  const toast = useToast();
  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState<AlertStatusFilter>("ALL");
  const [limit, setLimit] = useState<number>(20);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [acknowledgingAlertId, setAcknowledgingAlertId] = useState<string | null>(
    null,
  );

  const loadAlerts = useCallback(
    async (background = false) => {
      if (background) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        setLoadError(null);

        const response = await teacherService.getAlerts({
          status: statusFilter === "ALL" ? undefined : statusFilter,
          limit,
        });

        setAlerts(response);
      } catch (error) {
        setLoadError(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [limit, statusFilter],
  );

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  async function handleAcknowledge(alertId: string) {
    setActionError(null);
    setSuccessMessage(null);
    setAcknowledgingAlertId(alertId);

    try {
      await teacherService.acknowledgeAlert(alertId);
      await loadAlerts(true);
      setSuccessMessage("Alert acknowledged successfully.");
      toast.success("Alert acknowledged.");
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setAcknowledgingAlertId(null);
    }
  }

  if (isLoading) {
    return (
      <DashboardPage
        eyebrow="Teacher / Alerts"
        title="Alerts"
        description="Review recent classroom distance alerts and acknowledge active items."
      >
        <DashboardLoadingState label="Loading alerts..." />
      </DashboardPage>
    );
  }

  if (loadError) {
    return (
      <DashboardPage
        eyebrow="Teacher / Alerts"
        title="Alerts"
        description="Review recent classroom distance alerts and acknowledge active items."
      >
        <DashboardErrorState
          title="Could not load alerts"
          description={loadError}
          action={
            <Button type="button" variant="secondary" size="sm" onClick={() => void loadAlerts()}>
              Retry
            </Button>
          }
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      eyebrow="Teacher / Alerts"
      title="Alerts"
      description="Review recent classroom distance alerts and acknowledge active items."
    >
      <DashboardSectionCard
        eyebrow="Teacher feed"
        title="Distance alerts"
        description="Filter your classroom alerts and acknowledge the ones that need review."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-[180px] flex-col gap-2 text-sm text-[var(--on-surface-variant)]">
              <span>Status</span>
              <Select
                value={statusFilter}
                onChange={(event) => {
                  setSuccessMessage(null);
                  setStatusFilter(event.target.value as AlertStatusFilter);
                }}
              >
                {ALERT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex min-w-[160px] flex-col gap-2 text-sm text-[var(--on-surface-variant)]">
              <span>Limit</span>
              <Select
                value={String(limit)}
                onChange={(event) => {
                  setSuccessMessage(null);
                  setLimit(Number(event.target.value));
                }}
              >
                {ALERT_LIMIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void loadAlerts(true)}
              disabled={isRefreshing || acknowledgingAlertId !== null}
            >
              <RefreshCcw className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {successMessage ? (
            <MutationFeedback message={successMessage} variant="neutral" />
          ) : null}
          {actionError ? <MutationFeedback message={actionError} /> : null}

          {alerts.length === 0 ? (
            <DashboardEmptyState
              title="No alerts found"
              description={
                statusFilter === "ALL"
                  ? "No alerts have been created for this classroom yet."
                  : `No ${statusFilter.toLowerCase()} alerts matched the current filter.`
              }
              action={
                statusFilter !== "ALL" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setStatusFilter("ALL")}
                  >
                    Clear filter
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                <CheckCircle2 className="size-4 text-[var(--primary)]" />
                Showing {alerts.length} alert{alerts.length === 1 ? "" : "s"} sorted from newest to oldest.
              </div>
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  isAcknowledging={acknowledgingAlertId === alert.id}
                  onAcknowledge={(alertId) => {
                    void handleAcknowledge(alertId);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardSectionCard>
    </DashboardPage>
  );
}
