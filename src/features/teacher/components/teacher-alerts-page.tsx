"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCcw, Trash2, UsersRound } from "lucide-react";

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
import { getTeacherStudentDisplayName } from "@/features/teacher/student-utils";
import { formatDateTime } from "@/lib/format/date-time";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type {
  TeacherAlert,
  TeacherAlertStatus,
  TeacherClass,
  TeacherStudent,
} from "@/types/teacher";

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

type SelectedStudentPair = {
  id: string;
  classId: string;
  className: string;
  firstStudentId: string;
  firstStudentName: string;
  secondStudentId: string;
  secondStudentName: string;
};

const PAIR_STORAGE_KEY = "kindermotion:teacher-alert-student-pairs";

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

function buildPairId(classId: string, firstStudentId: string, secondStudentId: string) {
  const [left, right] = [firstStudentId, secondStudentId].sort();

  return `${classId}:${left}:${right}`;
}

function loadStoredPairs() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(PAIR_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (pair): pair is SelectedStudentPair =>
        typeof pair?.id === "string" &&
        typeof pair?.classId === "string" &&
        typeof pair?.className === "string" &&
        typeof pair?.firstStudentId === "string" &&
        typeof pair?.firstStudentName === "string" &&
        typeof pair?.secondStudentId === "string" &&
        typeof pair?.secondStudentName === "string",
    );
  } catch {
    return [];
  }
}

function saveStoredPairs(pairs: SelectedStudentPair[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PAIR_STORAGE_KEY, JSON.stringify(pairs));
}

export function TeacherAlertsPageContent() {
  const toast = useToast();
  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [firstStudentId, setFirstStudentId] = useState("");
  const [secondStudentId, setSecondStudentId] = useState("");
  const [selectedPairs, setSelectedPairs] = useState<SelectedStudentPair[]>(
    () => loadStoredPairs(),
  );
  const [statusFilter, setStatusFilter] = useState<AlertStatusFilter>("ALL");
  const [limit, setLimit] = useState<number>(20);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pairError, setPairError] = useState<string | null>(null);
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

  useEffect(() => {
    saveStoredPairs(selectedPairs);
  }, [selectedPairs]);

  useEffect(() => {
    let isActive = true;

    async function loadClasses() {
      try {
        setPairError(null);
        const response = await teacherService.listMyClasses();

        if (!isActive) {
          return;
        }

        setClasses(response);

        setSelectedClassId((currentClassId) =>
          currentClassId || response[0]?.id || "",
        );
      } catch (error) {
        if (isActive) {
          setPairError(getApiErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoadingClasses(false);
        }
      }
    }

    void loadClasses();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadStudents() {
      if (!selectedClassId) {
        setStudents([]);
        setFirstStudentId("");
        setSecondStudentId("");
        return;
      }

      try {
        setPairError(null);
        setIsLoadingStudents(true);
        const response = await teacherService.getClassStudents(selectedClassId, {
          page: 1,
          limit: 100,
        });

        if (!isActive) {
          return;
        }

        setStudents(response.items);
        setFirstStudentId("");
        setSecondStudentId("");
      } catch (error) {
        if (isActive) {
          setPairError(getApiErrorMessage(error));
          setStudents([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingStudents(false);
        }
      }
    }

    void loadStudents();

    return () => {
      isActive = false;
    };
  }, [selectedClassId]);

  const selectedClass = classes.find((classItem) => classItem.id === selectedClassId);
  const firstStudentOptions = students.filter(
    (student) => student.id !== secondStudentId,
  );
  const secondStudentOptions = students.filter(
    (student) => student.id !== firstStudentId,
  );
  const selectedClassAlerts = useMemo(
    () =>
      selectedClassId
        ? alerts.filter((alert) => alert.classroomId === selectedClassId)
        : alerts,
    [alerts, selectedClassId],
  );
  const activeSelectedClassAlerts = selectedClassAlerts.filter(
    (alert) => alert.status === "ACTIVE",
  );

  function handleAddPair() {
    setPairError(null);

    if (!selectedClass) {
      setPairError("Select a class before adding a student pair.");
      return;
    }

    if (!firstStudentId || !secondStudentId) {
      setPairError("Select two students to create a pair.");
      return;
    }

    if (firstStudentId === secondStudentId) {
      setPairError("A pair must contain two different students.");
      return;
    }

    const firstStudent = students.find((student) => student.id === firstStudentId);
    const secondStudent = students.find((student) => student.id === secondStudentId);

    if (!firstStudent || !secondStudent) {
      setPairError("Selected students could not be found in this class.");
      return;
    }

    const pairId = buildPairId(selectedClass.id, firstStudent.id, secondStudent.id);

    if (selectedPairs.some((pair) => pair.id === pairId)) {
      setPairError("This student pair is already selected.");
      return;
    }

    setSelectedPairs((currentPairs) => [
      ...currentPairs,
      {
        id: pairId,
        classId: selectedClass.id,
        className: selectedClass.name,
        firstStudentId: firstStudent.id,
        firstStudentName: getTeacherStudentDisplayName(firstStudent),
        secondStudentId: secondStudent.id,
        secondStudentName: getTeacherStudentDisplayName(secondStudent),
      },
    ]);
    setFirstStudentId("");
    setSecondStudentId("");
  }

  function handleRemovePair(pairId: string) {
    setSelectedPairs((currentPairs) =>
      currentPairs.filter((pair) => pair.id !== pairId),
    );
  }

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
        eyebrow="Student pairs"
        title="Pair monitoring"
        description="Select student pairs inside a class. When these students fall under the configured distance threshold, the resulting distance alerts should be reviewed here."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void loadAlerts(true)}
            disabled={isRefreshing || acknowledgingAlertId !== null}
          >
            <RefreshCcw className={isRefreshing ? "animate-spin" : ""} />
            Refresh alerts
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 rounded-[1.5rem] bg-[var(--surface-container-low)] p-4 lg:grid-cols-[minmax(180px,0.8fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto] lg:items-end">
            <label className="grid gap-2 text-sm text-[var(--on-surface-variant)]">
              <span>Class</span>
              <Select
                value={selectedClassId}
                disabled={isLoadingClasses}
                onChange={(event) => {
                  setPairError(null);
                  setSelectedClassId(event.target.value);
                }}
              >
                {classes.length === 0 ? (
                  <option value="">No classes</option>
                ) : (
                  classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))
                )}
              </Select>
            </label>

            <label className="grid gap-2 text-sm text-[var(--on-surface-variant)]">
              <span>First student</span>
              <Select
                value={firstStudentId}
                disabled={!selectedClassId || isLoadingStudents}
                onChange={(event) => {
                  setPairError(null);
                  setFirstStudentId(event.target.value);
                }}
              >
                <option value="">
                  {isLoadingStudents ? "Loading students" : "Select student"}
                </option>
                {firstStudentOptions.map((student) => (
                  <option key={student.id} value={student.id}>
                    {getTeacherStudentDisplayName(student)}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-2 text-sm text-[var(--on-surface-variant)]">
              <span>Second student</span>
              <Select
                value={secondStudentId}
                disabled={!selectedClassId || isLoadingStudents}
                onChange={(event) => {
                  setPairError(null);
                  setSecondStudentId(event.target.value);
                }}
              >
                <option value="">
                  {isLoadingStudents ? "Loading students" : "Select student"}
                </option>
                {secondStudentOptions.map((student) => (
                  <option key={student.id} value={student.id}>
                    {getTeacherStudentDisplayName(student)}
                  </option>
                ))}
              </Select>
            </label>

            <Button
              type="button"
              size="sm"
              disabled={isLoadingStudents || students.length < 2}
              onClick={handleAddPair}
            >
              <UsersRound />
              Add pair
            </Button>
          </div>

          {pairError ? <MutationFeedback message={pairError} /> : null}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[var(--on-surface)]">
                    Selected student pairs
                  </p>
                  <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                    These pairs define who should be watched for threshold-based distance alerts.
                  </p>
                </div>
                <Badge>{selectedPairs.length}</Badge>
              </div>

              {selectedPairs.length === 0 ? (
                <DashboardEmptyState
                  title="No student pairs selected"
                  description="Choose a class and two students to create the pair list teachers will review for distance threshold alerts."
                />
              ) : (
                <div className="grid gap-3">
                  {selectedPairs.map((pair) => (
                    <div
                      key={pair.id}
                      className="flex flex-col gap-3 rounded-[1.25rem] bg-[var(--surface-container-lowest)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-[var(--on-surface)]">
                          {pair.firstStudentName} + {pair.secondStudentName}
                        </p>
                        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                          {pair.className}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemovePair(pair.id)}
                      >
                        <Trash2 />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-4">
              <p className="text-base font-semibold text-[var(--on-surface)]">
                Alert list for selected pairs
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--on-surface-variant)]">
                If a selected pair drops below the configured distance threshold,
                the system should surface it as an active distance alert in this feed.
              </p>

              <div className="mt-4 grid gap-3">
                {selectedPairs.length === 0 ? (
                  <p className="rounded-[1.25rem] bg-[var(--surface-container-lowest)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
                    Add at least one pair to define the alert review list.
                  </p>
                ) : (
                  selectedPairs.map((pair) => (
                    <div
                      key={pair.id}
                      className="rounded-[1.25rem] bg-[var(--surface-container-lowest)] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--on-surface)]">
                          {pair.firstStudentName} / {pair.secondStudentName}
                        </p>
                        <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                          Watching
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                        Alert condition: pair distance below threshold.
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 rounded-[1.25rem] bg-[var(--surface-container-lowest)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
                {activeSelectedClassAlerts.length} active classroom alert
                {activeSelectedClassAlerts.length === 1 ? "" : "s"} currently match the selected class.
              </div>
            </div>
          </div>
        </div>
      </DashboardSectionCard>

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
