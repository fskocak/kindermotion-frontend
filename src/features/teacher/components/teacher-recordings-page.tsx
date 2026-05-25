"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  ExternalLink,
  FileVideo,
  RefreshCcw,
  Trash2,
  Video,
} from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardPagination } from "@/components/dashboard/dashboard-pagination";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { Select } from "@/components/ui/select";
import { TeacherLiveRecordingPanel } from "@/features/teacher/components/teacher-live-recording-panel";
import { TeacherMlUploadCard } from "@/features/teacher/components/teacher-ml-upload-card";
import { formatDateTime } from "@/lib/format/date-time";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type { PaginationMeta } from "@/types/api";
import type {
  TeacherClass,
  TeacherRecording,
  TeacherRecordingAssetAccess,
} from "@/types/teacher";

const RECORDINGS_PAGE_LIMIT = 10;

function formatDuration(durationMs: number | null) {
  if (durationMs === null) {
    return "N/A";
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
}

function isAccessAvailable(access?: TeacherRecordingAssetAccess | null) {
  return Boolean(access?.previewUrl || access?.downloadUrl);
}

function isAccessExpired(access?: TeacherRecordingAssetAccess | null) {
  if (!access?.expiresAt) {
    return false;
  }

  return new Date(access.expiresAt).getTime() <= Date.now();
}

function getRecordingsErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return "Teacher recordings endpoint is not available on the backend yet.";
  }

  return getApiErrorMessage(error);
}

function openAssetUrl(url: string, action: AssetActionKind) {
  if (action === "preview") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

type AssetActionKind = "preview" | "download";

type AssetAccessState = {
  access: TeacherRecordingAssetAccess | null;
  error: string | null;
  loadingAction: AssetActionKind | null;
};

const DEFAULT_ASSET_ACCESS_STATE: AssetAccessState = {
  access: null,
  error: null,
  loadingAction: null,
};

type RecordingMetaItemProps = {
  label: string;
  value: string;
};

function RecordingMetaItem({ label, value }: RecordingMetaItemProps) {
  return (
    <div className="rounded-[1.25rem] bg-[var(--surface-container-low)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[var(--on-surface)]">{value}</p>
    </div>
  );
}

type AssetActionsProps = {
  title: string;
  accessState: AssetAccessState;
  isReady: boolean;
  onRequestAccess: (action: AssetActionKind) => void;
};

function AssetActions({
  title,
  accessState,
  isReady,
  onRequestAccess,
}: AssetActionsProps) {
  const hasPreview = Boolean(accessState.access?.previewUrl);
  const hasDownload = Boolean(accessState.access?.downloadUrl);
  const previewLoading = accessState.loadingAction === "preview";
  const downloadLoading = accessState.loadingAction === "download";
  const hasLoaded = accessState.access !== null || accessState.error !== null;

  return (
    <div className="rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface-container-low)] p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-[var(--on-surface)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
          {!isReady
            ? "Asset is not ready for secure access yet."
            : hasPreview || hasDownload
              ? "Secure asset actions are available from the backend."
              : hasLoaded
                ? "Backend did not expose a usable preview or download URL for this asset."
                : "Preview and download URLs are fetched only when requested."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="sm"
          variant={hasPreview ? "default" : "secondary"}
          disabled={!isReady || previewLoading}
          onClick={() => onRequestAccess("preview")}
        >
          <ExternalLink />
          {previewLoading ? "Loading preview..." : "Preview"}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!isReady || downloadLoading}
          onClick={() => onRequestAccess("download")}
        >
          <ExternalLink />
          {downloadLoading ? "Loading download..." : "Download"}
        </Button>
      </div>

      {accessState.error ? (
        <MutationFeedback className="mt-3" message={accessState.error} />
      ) : null}
    </div>
  );
}

type RecordingCardProps = {
  recording: TeacherRecording;
  recordingAccessState: AssetAccessState;
  onRequestRecordingAccess: (recordingId: string, action: AssetActionKind) => void;
  onDeleteRecording: (recordingId: string) => void;
  isDeletingRecording: boolean;
};

function RecordingCard({
  recording,
  recordingAccessState,
  onRequestRecordingAccess,
  onDeleteRecording,
  isDeletingRecording,
}: RecordingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const recordingAccessAvailable = isAccessAvailable(recordingAccessState.access);
  const recordingAssetReady = recording.assetStatus === "READY";

  return (
    <article className="rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--surface-container-lowest)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
        >
          <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-[var(--surface-container-low)] text-[var(--on-surface)]">
            <ChevronDown
              className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </span>
          <span className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={recording.status === "READY" ? "primary" : "muted"}>
              {recording.status}
            </Badge>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-container-low)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
              <Video className="size-3.5" />
              {recording.assetStatus ?? "UNKNOWN ASSET"}
            </div>
            {recording.mlJob ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-container-low)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
                <FileVideo className="size-3.5" />
                ML {recording.mlJob.status}
              </div>
            ) : null}
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
              Recording result
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--on-surface-variant)]">
              {formatDateTime(recording.startedAt)} · {formatDuration(recording.durationMs)}
            </p>
          </div>
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <div className="rounded-[1.25rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
            <span className="font-semibold text-[var(--on-surface)]">Access:</span>{" "}
            {recordingAccessAvailable ? "Ready" : "On demand"}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isDeletingRecording}
            onClick={() => onDeleteRecording(recording.id)}
          >
            <Trash2 />
            {isDeletingRecording ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {isExpanded ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <RecordingMetaItem label="Started At" value={formatDateTime(recording.startedAt)} />
            <RecordingMetaItem label="Ended At" value={formatDateTime(recording.endedAt)} />
            <RecordingMetaItem label="Duration" value={formatDuration(recording.durationMs)} />
            <RecordingMetaItem
              label="Asset Ready"
              value={recording.assetStatus === "READY" ? "Yes" : "No"}
            />
          </div>
          <AssetActions
            title="Recording asset"
            accessState={recordingAccessState}
            isReady={recordingAssetReady}
            onRequestAccess={(action) => onRequestRecordingAccess(recording.id, action)}
          />
          {recording.mlJob ? (
            <div className="rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface-container-low)] p-4">
              <p className="text-sm font-semibold text-[var(--on-surface)]">ML outputs</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <RecordingMetaItem
                  label="Video IDs"
                  value={recording.mlJob.trackIds.join(", ") || "None"}
                />
                <RecordingMetaItem
                  label="PDF"
                  value={recording.mlJob.reportAsset?.status ?? "Missing"}
                />
                <RecordingMetaItem
                  label="Processed Video"
                  value={recording.mlJob.processedVideoAsset?.status ?? "Missing"}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function TeacherRecordingsPageContent() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordings, setRecordings] = useState<TeacherRecording[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: RECORDINGS_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [recordingAccessStates, setRecordingAccessStates] = useState<
    Record<string, AssetAccessState>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recordingMutationMessage, setRecordingMutationMessage] = useState<string | null>(null);
  const [recordingMutationError, setRecordingMutationError] = useState<string | null>(null);
  const [deletingRecordingId, setDeletingRecordingId] = useState<string | null>(null);

  const selectedClass = classes.find((classItem) => classItem.id === selectedClassId);

  const loadRecordings = useCallback(async (background = false) => {
    if (!selectedClassId) {
      setRecordings([]);
      setPaginationMeta({
        page: 1,
        limit: RECORDINGS_PAGE_LIMIT,
        total: 0,
        totalPages: 1,
      });
      setRecordingAccessStates({});
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (background) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setLoadError(null);
      const response = await teacherService.getRecordings({
        classId: selectedClassId,
        date: selectedDate || undefined,
        page: currentPage,
        limit: RECORDINGS_PAGE_LIMIT,
      });
      setRecordings(response.items);
      setPaginationMeta(response.meta);
      setRecordingAccessStates({});
    } catch (error) {
      setLoadError(getRecordingsErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, selectedClassId, selectedDate]);

  async function deleteRecording(recordingId: string) {
    setDeletingRecordingId(recordingId);
    setRecordingMutationError(null);

    try {
      await teacherService.deleteRecording(recordingId);
      setRecordingMutationMessage("Recording deleted.");
      if (recordings.length === 1 && currentPage > 1) {
        setCurrentPage((page) => Math.max(1, page - 1));
      } else {
        await loadRecordings(true);
      }
    } catch (error) {
      setRecordingMutationError(getApiErrorMessage(error));
    } finally {
      setDeletingRecordingId(null);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadClasses() {
      try {
        setLoadError(null);
        const response = await teacherService.listMyClasses();

        if (!isActive) {
          return;
        }

        setClasses(response);
      } catch (error) {
        if (isActive) {
          setLoadError(getApiErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoadingClasses(false);
          setIsLoading(false);
        }
      }
    }

    void loadClasses();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoadingClasses) {
      void loadRecordings();
    }
  }, [isLoadingClasses, loadRecordings]);

  async function requestAccess(
    kind: "recording",
    id: string,
    action: AssetActionKind,
  ) {
    const stateSetter = setRecordingAccessStates;
    const stateMap = recordingAccessStates;
    const currentState = stateMap[id] ?? DEFAULT_ASSET_ACCESS_STATE;
    const currentAccess = currentState.access;

    if (currentAccess && !isAccessExpired(currentAccess)) {
      const directUrl =
        action === "preview" ? currentAccess.previewUrl : currentAccess.downloadUrl;

      if (directUrl) {
        openAssetUrl(directUrl, action);
        return;
      }
    }

    stateSetter((current) => ({
      ...current,
      [id]: {
        access: current[id]?.access ?? null,
        error: null,
        loadingAction: action,
      },
    }));

    try {
      const access = await teacherService.getRecordingAccess(id);
      const requestedUrl =
        action === "preview" ? access.previewUrl : access.downloadUrl;

      stateSetter((current) => ({
        ...current,
        [id]: {
          access,
          error: requestedUrl
            ? null
            : action === "preview"
              ? "Preview is not available for this asset."
              : "Download is not available for this asset.",
          loadingAction: null,
        },
      }));

      if (requestedUrl) {
        openAssetUrl(requestedUrl, action);
      }
    } catch (error) {
      stateSetter((current) => ({
        ...current,
        [id]: {
          access: null,
          error: getApiErrorMessage(error),
          loadingAction: null,
        },
      }));
    }
  }

  if (isLoading || isLoadingClasses) {
    return (
      <DashboardPage
        eyebrow="Teacher / Recordings"
        title="Recordings"
        description="Review recording results exposed by the backend."
      >
        <DashboardLoadingState label="Loading recordings..." />
      </DashboardPage>
    );
  }

  if (loadError) {
    return (
      <DashboardPage
        eyebrow="Teacher / Recordings"
        title="Recordings"
        description="Review recording results exposed by the backend."
      >
        <DashboardErrorState
          title="Could not load recordings"
          description={loadError}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void loadRecordings()}
            >
              Retry
            </Button>
          }
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      eyebrow="Teacher / Recordings"
      title="Recordings"
      description="Review recording results exposed by the backend."
    >
      <DashboardSectionCard
        eyebrow="Filters"
        title="Choose classroom and date"
        description="Recordings are loaded only for the selected classroom. The API also verifies the classroom belongs to the signed-in teacher."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void loadRecordings(true)}
            disabled={isRefreshing || !selectedClassId}
          >
            <RefreshCcw className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      >
        <div className="grid gap-4 rounded-[1.5rem] bg-[var(--surface-container-low)] p-4 md:grid-cols-[minmax(0,1.3fr)_minmax(180px,0.7fr)]">
          <div className="grid gap-2">
            <Label htmlFor="recordings-classroom-filter">Classroom</Label>
            <Select
              id="recordings-classroom-filter"
              value={selectedClassId}
              onChange={(event) => {
                setSelectedClassId(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Select classroom</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recordings-date-filter">Date</Label>
            <Input
              id="recordings-date-filter"
              type="date"
              value={selectedDate}
              disabled={!selectedClassId}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {!selectedClassId ? (
          <div className="mt-4">
            <DashboardEmptyState
              title="Select a classroom"
              description="Choose one of your classrooms first, then optionally narrow the recordings by date."
            />
          </div>
        ) : null}
      </DashboardSectionCard>

      {selectedClassId ? (
        <>
          <TeacherLiveRecordingPanel
            classId={selectedClassId}
            onRecordingProcessed={() => {
              void loadRecordings(true);
            }}
          />

          <TeacherMlUploadCard classId={selectedClassId} />
        </>
      ) : null}


      {selectedClassId ? (
        <DashboardSectionCard
          eyebrow="Teacher media"
          title={selectedClass ? `${selectedClass.name} recordings` : "Recording results"}
          description="Metadata comes from the API, and preview/download only activate when the backend provides secure access."
        >
        {recordings.length === 0 ? (
          <DashboardEmptyState
            title="No recordings found"
            description="No recordings match the selected classroom and date."
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-[1.25rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
              Showing {recordings.length} of {paginationMeta.total} recording
              {paginationMeta.total === 1 ? "" : "s"}, newest first.
            </div>
            {recordings.map((recording) => (
              <RecordingCard
                key={recording.id}
                recording={recording}
                recordingAccessState={
                  recordingAccessStates[recording.id] ?? DEFAULT_ASSET_ACCESS_STATE
                }
                onRequestRecordingAccess={(recordingId, action) => {
                  void requestAccess("recording", recordingId, action);
                }}
                onDeleteRecording={(recordingId) => {
                  void deleteRecording(recordingId);
                }}
                isDeletingRecording={deletingRecordingId === recording.id}
              />
            ))}
            <DashboardPagination
              page={paginationMeta.page}
              totalPages={paginationMeta.totalPages}
              total={paginationMeta.total}
              itemLabel="recording"
              onPrevious={() => {
                setCurrentPage((page) => Math.max(1, page - 1));
              }}
              onNext={() => {
                setCurrentPage((page) =>
                  Math.min(paginationMeta.totalPages, page + 1),
                );
              }}
            />
          </div>
        )}
        </DashboardSectionCard>
      ) : null}

    </DashboardPage>
  );
}
