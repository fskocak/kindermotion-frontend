"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  RefreshCcw,
  Trash2,
  UsersRound,
  Volume2,
  VolumeX,
} from "lucide-react";

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

function formatSeconds(seconds: number) {
  return `${Math.round(seconds)} s`;
}

function playAlertBeep() {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextClass =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();

  const startTone = () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.12);
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.16,
      audioContext.currentTime + 0.02,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.28,
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
    oscillator.onended = () => {
      void audioContext.close();
    };
  };

  if (audioContext.state === "suspended") {
    void audioContext.resume().then(startTone).catch(() => {
      void audioContext.close();
    });
    return;
  }

  startTone();
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

type AlertMediaPreviewProps = {
  alert: TeacherAlert;
};

function AlertMediaPreview({ alert }: AlertMediaPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewUrl = alert.media?.access.previewUrl;

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement || !alert.media) {
      return;
    }

    const seekToAlert = () => {
      videoElement.currentTime = alert.media?.alertOffsetSeconds ?? 0;
    };

    if (videoElement.readyState >= 1) {
      seekToAlert();
      return;
    }

    videoElement.addEventListener("loadedmetadata", seekToAlert, { once: true });

    return () => {
      videoElement.removeEventListener("loadedmetadata", seekToAlert);
    };
  }, [alert.media]);

  if (!alert.media || !previewUrl) {
    return null;
  }

  return (
    <div className="mt-5 grid gap-3 rounded-[1.25rem] bg-[var(--surface-container-low)] p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--on-surface)]">
          Alert video
        </p>
        <p className="text-xs font-medium text-[var(--on-surface-variant)]">
          Starts at {formatSeconds(alert.media.alertOffsetSeconds)}
        </p>
      </div>
      <video
        ref={videoRef}
        src={previewUrl}
        controls
        preload="metadata"
        className="aspect-video w-full rounded-[1rem] bg-black object-contain"
      />
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

      <AlertMediaPreview alert={alert} />

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

export function TeacherAlertsPageContent() {
  const toast = useToast();
  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [firstStudentId, setFirstStudentId] = useState("");
  const [secondStudentId, setSecondStudentId] = useState("");
  const [selectedPairs, setSelectedPairs] = useState<SelectedStudentPair[]>([]);
  const [statusFilter, setStatusFilter] = useState<AlertStatusFilter>("ALL");
  const [limit, setLimit] = useState<number>(20);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSavingPair, setIsSavingPair] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pairError, setPairError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [acknowledgingAlertId, setAcknowledgingAlertId] = useState<string | null>(
    null,
  );
  const activeAlertIdsRef = useRef<Set<string>>(new Set());

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

        const activeAlertIds = new Set(
          response
            .filter((alert) => alert.status === "ACTIVE")
            .map((alert) => alert.id),
        );
        const hasNewActiveAlert = response.some(
          (alert) =>
            alert.status === "ACTIVE" && !activeAlertIdsRef.current.has(alert.id),
        );

        if (background && isSoundEnabled && hasNewActiveAlert) {
          playAlertBeep();
        }

        activeAlertIdsRef.current = activeAlertIds;
        setAlerts(response);
      } catch (error) {
        setLoadError(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isSoundEnabled, limit, statusFilter],
  );

  useEffect(() => {
    void loadAlerts();

    const intervalId = window.setInterval(() => {
      void loadAlerts(true);
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadAlerts]);

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
        const [response, watchPair] = await Promise.all([
          teacherService.getClassStudents(selectedClassId, {
            page: 1,
            limit: 100,
          }),
          teacherService.getAlertWatchPair(selectedClassId),
        ]);

        if (!isActive) {
          return;
        }

        setStudents(response.items);
        setSelectedPairs(
          watchPair
            ? [
                {
                  id: buildPairId(
                    watchPair.classroomId,
                    watchPair.firstStudentId,
                    watchPair.secondStudentId,
                  ),
                  classId: watchPair.classroomId,
                  className:
                    classes.find((classItem) => classItem.id === watchPair.classroomId)
                      ?.name ?? "Selected class",
                  firstStudentId: watchPair.firstStudentId,
                  firstStudentName: watchPair.firstStudent.fullName,
                  secondStudentId: watchPair.secondStudentId,
                  secondStudentName: watchPair.secondStudent.fullName,
                },
              ]
            : [],
        );
        setFirstStudentId("");
        setSecondStudentId("");
      } catch (error) {
        if (isActive) {
          setPairError(getApiErrorMessage(error));
          setStudents([]);
          setSelectedPairs([]);
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
  }, [classes, selectedClassId]);

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

  async function handleAddPair() {
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

    try {
      setIsSavingPair(true);
      const watchPair = await teacherService.upsertAlertWatchPair({
        classroomId: selectedClass.id,
        firstStudentId: firstStudent.id,
        secondStudentId: secondStudent.id,
      });

      setSelectedPairs([
        {
          id: buildPairId(
            watchPair.classroomId,
            watchPair.firstStudentId,
            watchPair.secondStudentId,
          ),
          classId: selectedClass.id,
          className: selectedClass.name,
          firstStudentId: watchPair.firstStudentId,
          firstStudentName: watchPair.firstStudent.fullName,
          secondStudentId: watchPair.secondStudentId,
          secondStudentName: watchPair.secondStudent.fullName,
        },
      ]);
      setFirstStudentId("");
      setSecondStudentId("");
      toast.success("Alert watch pair saved.");
    } catch (error) {
      setPairError(getApiErrorMessage(error));
    } finally {
      setIsSavingPair(false);
    }
  }

  async function handleRemovePair(pairId: string) {
    if (!selectedClassId) {
      return;
    }

    try {
      setIsSavingPair(true);
      await teacherService.deleteAlertWatchPair(selectedClassId);
      setSelectedPairs((currentPairs) =>
        currentPairs.filter((pair) => pair.id !== pairId),
      );
      toast.success("Alert watch pair removed.");
    } catch (error) {
      setPairError(getApiErrorMessage(error));
    } finally {
      setIsSavingPair(false);
    }
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
        eyebrow="Student pair"
        title="Alert watch pair"
        description="Select two students inside a class. Distance alerts are generated only for this saved pair when their tracked distance falls below 120px."
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
              disabled={isSavingPair || isLoadingStudents || students.length < 2}
              onClick={() => void handleAddPair()}
            >
              <UsersRound />
              {selectedPairs.length > 0 ? "Update pair" : "Save pair"}
            </Button>
          </div>

          {pairError ? <MutationFeedback message={pairError} /> : null}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[var(--on-surface)]">
                    Saved alert watch pair
                  </p>
                  <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                    This pair defines who should be watched for threshold-based distance alerts.
                  </p>
                </div>
                <Badge>{selectedPairs.length}</Badge>
              </div>

              {selectedPairs.length === 0 ? (
                  <DashboardEmptyState
                  title="No alert watch pair selected"
                  description="Choose a class and two students. If no pair is saved, no distance alerts are generated for recordings."
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
                        disabled={isSavingPair}
                        onClick={() => void handleRemovePair(pair.id)}
                      >
                        <Trash2 />
                        {isSavingPair ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-4">
              <p className="text-base font-semibold text-[var(--on-surface)]">
                Alert rule
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--on-surface-variant)]">
                If the saved pair drops below 120px in a processed recording,
                the system surfaces it as an active distance alert in this feed.
              </p>

              <div className="mt-4 grid gap-3">
                {selectedPairs.length === 0 ? (
                  <p className="rounded-[1.25rem] bg-[var(--surface-container-lowest)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
                    Save one pair to enable distance alert generation.
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
                        Alert condition: pair distance below 120px.
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
              variant={isSoundEnabled ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                const nextSoundState = !isSoundEnabled;
                setIsSoundEnabled(nextSoundState);

                if (nextSoundState) {
                  playAlertBeep();
                }
              }}
            >
              {isSoundEnabled ? <Volume2 /> : <VolumeX />}
              {isSoundEnabled ? "Sound on" : "Sound off"}
            </Button>
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
