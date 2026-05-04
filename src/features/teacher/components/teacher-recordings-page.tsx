"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Check,
  ExternalLink,
  FileVideo,
  ImageIcon,
  Minus,
  RefreshCcw,
  Trash2,
  Upload,
  Video,
} from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/format/date-time";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type {
  TeacherClass,
  TeacherRecording,
  TeacherRecordingAssetAccess,
  TeacherMlProcessingJob,
  TeacherMlRoiBox,
  TeacherMlVideoInitResponse,
  TeacherStudent,
} from "@/types/teacher";

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

type DrawingBox = TeacherMlRoiBox & {
  id: string;
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
  snapshotAccessState: AssetAccessState;
  onRequestRecordingAccess: (recordingId: string, action: AssetActionKind) => void;
  onRequestSnapshotAccess: (snapshotId: string, action: AssetActionKind) => void;
  onDeleteRecording: (recordingId: string) => void;
  isDeletingRecording: boolean;
};

function RecordingCard({
  recording,
  recordingAccessState,
  snapshotAccessState,
  onRequestRecordingAccess,
  onRequestSnapshotAccess,
  onDeleteRecording,
  isDeletingRecording,
}: RecordingCardProps) {
  const snapshotAvailable = Boolean(recording.snapshot);
  const recordingAccessAvailable = isAccessAvailable(recordingAccessState.access);
  const snapshotAccessAvailable = isAccessAvailable(snapshotAccessState.access);
  const recordingAssetReady = recording.assetStatus === "READY";
  const snapshotAssetReady = recording.snapshot?.status === "READY";

  return (
    <article className="rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--surface-container-lowest)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={recording.status === "READY" ? "primary" : "muted"}>
              {recording.status}
            </Badge>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-container-low)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
              <Video className="size-3.5" />
              {recording.assetStatus ?? "UNKNOWN ASSET"}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-container-low)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
              <ImageIcon className="size-3.5" />
              {snapshotAvailable ? "SNAPSHOT LINKED" : "NO SNAPSHOT"}
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
              Captured on camera {recording.cameraId} and stored by the backend control plane.
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-[var(--on-surface-variant)]">
          <div>
            <span className="font-semibold text-[var(--on-surface)]">Preview:</span>{" "}
            {recordingAccessAvailable ? "Available" : "Fetch on demand"}
          </div>
          <div>
            <span className="font-semibold text-[var(--on-surface)]">Download:</span>{" "}
            {recordingAccessState.access?.downloadUrl ? "Available" : "Fetch on demand"}
          </div>
          <div>
            <span className="font-semibold text-[var(--on-surface)]">Snapshot:</span>{" "}
            {snapshotAvailable ? "Linked" : "Missing"}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <RecordingMetaItem label="Started At" value={formatDateTime(recording.startedAt)} />
        <RecordingMetaItem label="Ended At" value={formatDateTime(recording.endedAt)} />
        <RecordingMetaItem label="Duration" value={formatDuration(recording.durationMs)} />
        <RecordingMetaItem label="Created" value={formatDateTime(recording.createdAt)} />
        <RecordingMetaItem label="Updated" value={formatDateTime(recording.updatedAt)} />
        <RecordingMetaItem
          label="Asset Ready"
          value={recording.assetStatus === "READY" ? "Yes" : "No"}
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface-container-low)] p-4">
          <AssetActions
            title="Recording asset"
            accessState={recordingAccessState}
            isReady={recordingAssetReady}
            onRequestAccess={(action) => onRequestRecordingAccess(recording.id, action)}
          />
          <div className="mt-3 flex flex-wrap gap-3">
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

        <div className="rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface-container-low)] p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-[var(--on-surface)]">Snapshot relation</p>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
              {recording.snapshot
                ? `Snapshot captured ${formatDateTime(recording.snapshot.capturedAt)} with status ${recording.snapshot.status}.`
                : "No snapshot metadata is linked to this recording yet."}
            </p>
          </div>

          {recording.snapshot ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <RecordingMetaItem
                  label="Snapshot Captured"
                  value={formatDateTime(recording.snapshot.capturedAt)}
                />
                <RecordingMetaItem
                  label="Snapshot Access"
                  value={snapshotAccessAvailable ? "Available" : "Fetch on demand"}
                />
              </div>
              <AssetActions
                title="Snapshot asset"
                accessState={snapshotAccessState}
                isReady={snapshotAssetReady ?? false}
                onRequestAccess={(action) =>
                  onRequestSnapshotAccess(recording.snapshot?.id ?? "", action)
                }
              />
            </div>
          ) : null}
        </div>
      </div>

      {recording.mlJob ? (
        <div className="mt-5 rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface-container-low)] p-4">
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
    </article>
  );
}

export function TeacherRecordingsPageContent() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [recordings, setRecordings] = useState<TeacherRecording[]>([]);
  const [recordingAccessStates, setRecordingAccessStates] = useState<
    Record<string, AssetAccessState>
  >({});
  const [snapshotAccessStates, setSnapshotAccessStates] = useState<
    Record<string, AssetAccessState>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mlVideoFile, setMlVideoFile] = useState<File | null>(null);
  const [isUploadingMlVideo, setIsUploadingMlVideo] = useState(false);
  const [mlUploadMessage, setMlUploadMessage] = useState<string | null>(null);
  const [mlUploadError, setMlUploadError] = useState<string | null>(null);
  const [mlInitResponse, setMlInitResponse] = useState<TeacherMlVideoInitResponse | null>(null);
  const [roiBoxes, setRoiBoxes] = useState<DrawingBox[]>([]);
  const [draftRoi, setDraftRoi] = useState<TeacherMlRoiBox | null>(null);
  const [imageBounds, setImageBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [pendingMlJob, setPendingMlJob] = useState<TeacherMlProcessingJob | null>(null);
  const [classStudents, setClassStudents] = useState<TeacherStudent[]>([]);
  const [trackMappings, setTrackMappings] = useState<Record<number, string>>({});
  const [pairWatchTrackIds, setPairWatchTrackIds] = useState<[string, string]>(["", ""]);
  const [isSavingMappings, setIsSavingMappings] = useState(false);
  const [deletingRecordingId, setDeletingRecordingId] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const selectedClass = classes.find((classItem) => classItem.id === selectedClassId);

  const loadClassStudents = useCallback(async () => {
    if (!selectedClassId) {
      setClassStudents([]);
      return [];
    }

    const response = await teacherService.getClassStudents(selectedClassId, {
      limit: 100,
    });
    setClassStudents(response.items);
    return response.items;
  }, [selectedClassId]);

  const loadRecordings = useCallback(async (background = false) => {
    if (!selectedClassId) {
      setRecordings([]);
      setRecordingAccessStates({});
      setSnapshotAccessStates({});
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
      });
      setRecordings(response);
      setRecordingAccessStates({});
      setSnapshotAccessStates({});
    } catch (error) {
      setLoadError(getRecordingsErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedClassId, selectedDate]);

  async function uploadMlVideo() {
    if (!mlVideoFile || !selectedClassId) {
      return;
    }

    const now = new Date();
    setIsUploadingMlVideo(true);
    setMlUploadError(null);
    setMlUploadMessage("Video is uploading. First frame will open here for ID selection.");
    setPendingMlJob(null);
    setMlInitResponse(null);
    setRoiBoxes([]);
    setDraftRoi(null);
    setImageBounds(null);
    setTrackMappings({});
    setPairWatchTrackIds(["", ""]);

    try {
      await loadClassStudents();
      const initResponse = await teacherService.uploadMlVideoInit({
        file: mlVideoFile,
        startedAt: now.toISOString(),
        endedAt: new Date(now.getTime() + 1000).toISOString(),
      });
      setMlInitResponse(initResponse);
      setMlUploadMessage("Draw a box around each child on the first frame, then start ML processing.");
    } catch (error) {
      setMlUploadError(getApiErrorMessage(error));
      setMlUploadMessage(null);
    } finally {
      setIsUploadingMlVideo(false);
    }
  }

  async function processMlVideoWithRois() {
    if (!mlInitResponse || roiBoxes.length === 0) {
      return;
    }

    const mappings = roiBoxes.map((_, index) => ({
      trackId: index + 1,
      studentId: trackMappings[index + 1] ?? "",
    }));
    const missingMapping = mappings.find((mapping) => !mapping.studentId);

    if (missingMapping) {
      setMlUploadError(`Select a student for Video ID ${missingMapping.trackId}.`);
      return;
    }

    if (
      pairWatchTrackIds[0] &&
      pairWatchTrackIds[1] &&
      pairWatchTrackIds[0] === pairWatchTrackIds[1]
    ) {
      setMlUploadError("Pair watch must use two different video IDs.");
      return;
    }

    setIsUploadingMlVideo(true);
    setMlUploadError(null);
    setMlUploadMessage("ML processing started. This can take a little while.");

    try {
      const mlResponse = await teacherService.processMlVideo({
        recordingKey: mlInitResponse.recording.recordingKey,
        objectKey: mlInitResponse.recording.objectKey,
        rois: roiBoxes.map(({ x, y, width, height }) => ({ x, y, width, height })),
        pairWatchTrackIds: pairWatchTrackIds
          .filter(Boolean)
          .map((value) => Number(value)),
      });

      const job = await teacherService.createMlProcessingJob({
        recordingKey: mlResponse.recording.recordingKey,
        runId: mlResponse.runId,
        status: mlResponse.status,
        trackIds: mlResponse.trackIds,
        artifacts: mlResponse.artifacts,
        errorMessage: mlResponse.errorMessage,
      });

      await teacherService.updateMlTrackMappings(job.id, {
        mappings: mappings.map((mapping) => ({
          trackId: mapping.trackId,
          studentId: mapping.studentId,
        })),
      });

      setPendingMlJob(null);
      setMlInitResponse(null);
      setRoiBoxes([]);
      setDraftRoi(null);
      setImageBounds(null);
      setMlVideoFile(null);
      setTrackMappings({});
      setPairWatchTrackIds(["", ""]);
      setMlUploadMessage("ML processing completed and IDs were matched to classroom students.");
      await loadRecordings(true);
    } catch (error) {
      setMlUploadError(getApiErrorMessage(error));
      setMlUploadMessage(null);
    } finally {
      setIsUploadingMlVideo(false);
    }
  }

  async function saveTrackMappings() {
    if (!pendingMlJob) {
      return;
    }

    const mappings = pendingMlJob.trackIds
      .map((trackId) => ({
        trackId,
        studentId: trackMappings[trackId],
      }))
      .filter((mapping) => mapping.studentId);

    setIsSavingMappings(true);
    setMlUploadError(null);

    try {
      const updatedJob = await teacherService.updateMlTrackMappings(pendingMlJob.id, {
        mappings,
      });
      setPendingMlJob(null);
      setTrackMappings({});
      setMlUploadMessage(
        `Track IDs were matched to classroom students for run ${updatedJob.runId ?? updatedJob.id}.`,
      );
      await loadRecordings(true);
    } catch (error) {
      setMlUploadError(getApiErrorMessage(error));
    } finally {
      setIsSavingMappings(false);
    }
  }

  async function deleteRecording(recordingId: string) {
    setDeletingRecordingId(recordingId);
    setMlUploadError(null);

    try {
      await teacherService.deleteRecording(recordingId);
      setMlUploadMessage("Recording deleted.");
      if (pendingMlJob && recordings.find((item) => item.id === recordingId)?.mlJob?.id === pendingMlJob.id) {
        setPendingMlJob(null);
      }
      await loadRecordings(true);
    } catch (error) {
      setMlUploadError(getApiErrorMessage(error));
    } finally {
      setDeletingRecordingId(null);
    }
  }

  function syncImageBounds() {
    if (!imageRef.current || !imageContainerRef.current) {
      return;
    }

    const containerBounds = imageContainerRef.current.getBoundingClientRect();
    const imageBounds = imageRef.current.getBoundingClientRect();

    setImageBounds({
      left: imageBounds.left - containerBounds.left,
      top: imageBounds.top - containerBounds.top,
      width: imageBounds.width,
      height: imageBounds.height,
    });
  }

  function toNaturalBox(box: TeacherMlRoiBox) {
    if (!mlInitResponse || !imageBounds) {
      return box;
    }

    const scaleX = mlInitResponse.frameWidth / imageBounds.width;
    const scaleY = mlInitResponse.frameHeight / imageBounds.height;

    return {
      x: Math.round(box.x * scaleX),
      y: Math.round(box.y * scaleY),
      width: Math.round(box.width * scaleX),
      height: Math.round(box.height * scaleY),
    };
  }

  function getRelativePoint(clientX: number, clientY: number) {
    if (!imageRef.current) {
      return null;
    }

    const bounds = imageRef.current.getBoundingClientRect();
    const rawX = clientX - bounds.left;
    const rawY = clientY - bounds.top;

    if (rawX < 0 || rawY < 0 || rawX > bounds.width || rawY > bounds.height) {
      return null;
    }

    const x = Math.max(0, Math.min(rawX, bounds.width));
    const y = Math.max(0, Math.min(rawY, bounds.height));

    return { x, y, width: bounds.width, height: bounds.height };
  }

  function startRoiDraft(clientX: number, clientY: number) {
    const point = getRelativePoint(clientX, clientY);
    if (!point) {
      return;
    }

    pointerStartRef.current = { x: point.x, y: point.y };
    setImageBounds((current) =>
      current
        ? current
        : { left: 0, top: 0, width: point.width, height: point.height },
    );
    setDraftRoi({ x: point.x, y: point.y, width: 0, height: 0 });
  }

  function updateRoiDraft(clientX: number, clientY: number) {
    const start = pointerStartRef.current;
    const point = getRelativePoint(clientX, clientY);
    if (!start || !point) {
      return;
    }

    const left = Math.min(start.x, point.x);
    const top = Math.min(start.y, point.y);
    const width = Math.abs(point.x - start.x);
    const height = Math.abs(point.y - start.y);

    setDraftRoi({ x: left, y: top, width, height });
  }

  function finishRoiDraft() {
    if (!draftRoi) {
      pointerStartRef.current = null;
      return;
    }

    if (draftRoi.width >= 12 && draftRoi.height >= 12) {
      const naturalBox = toNaturalBox(draftRoi);
      setRoiBoxes((current) => [
        ...current,
        { id: crypto.randomUUID(), ...naturalBox },
      ]);
    }

    pointerStartRef.current = null;
    setDraftRoi(null);
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

  useEffect(() => {
    if (!mlInitResponse) {
      return;
    }

    syncImageBounds();

    function handleResize() {
      syncImageBounds();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mlInitResponse]);

  async function requestAccess(
    kind: "recording" | "snapshot",
    id: string,
    action: AssetActionKind,
  ) {
    const stateSetter =
      kind === "recording" ? setRecordingAccessStates : setSnapshotAccessStates;
    const stateMap =
      kind === "recording" ? recordingAccessStates : snapshotAccessStates;
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
      const access =
        kind === "recording"
          ? await teacherService.getRecordingAccess(id)
          : await teacherService.getSnapshotAccess(id);
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
        description="Review recording and snapshot results exposed by the backend."
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
        description="Review recording and snapshot results exposed by the backend."
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
      description="Review recording and snapshot results exposed by the backend."
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
        <DashboardSectionCard
          eyebrow="ML upload"
          title="Process an uploaded classroom video"
          description="Use this while live camera recording is paused. Upload a video, mark each child on the first frame, then let ML process it for student matching."
          actions={
            <Button
              type="button"
              size="sm"
              disabled={!mlVideoFile || isUploadingMlVideo}
              onClick={() => void uploadMlVideo()}
            >
              <Upload />
              {isUploadingMlVideo ? "Processing..." : "Upload and process"}
            </Button>
          }
        >
          <div className="grid gap-4 rounded-[1.5rem] bg-[var(--surface-container-low)] p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="grid gap-2">
              <Label htmlFor="ml-video-upload">Video file</Label>
              <Input
                id="ml-video-upload"
                type="file"
                accept="video/*"
                disabled={isUploadingMlVideo}
                onChange={(event) => {
                  setMlVideoFile(event.target.files?.[0] ?? null);
                  setMlUploadError(null);
                  setMlUploadMessage(null);
                  setMlInitResponse(null);
                  setRoiBoxes([]);
                  setDraftRoi(null);
                  setImageBounds(null);
                  setPairWatchTrackIds(["", ""]);
                }}
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-container-lowest)] px-4 py-3 text-sm font-medium text-[var(--on-surface-variant)]">
              <FileVideo className="size-4" />
              {mlVideoFile ? mlVideoFile.name : "No video selected"}
            </div>
          </div>

          {mlUploadMessage ? (
            <div className="mt-4 rounded-[1.25rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm font-medium text-[var(--on-surface)]">
              {mlUploadMessage}
            </div>
          ) : null}
          {mlUploadError ? (
            <MutationFeedback className="mt-4" message={mlUploadError} />
          ) : null}

          {pendingMlJob ? (
            <div className="mt-5 rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface-container-lowest)] p-4">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--on-surface)]">
                    Match video IDs to students
                  </p>
                  <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                    These IDs came from the first-frame boxes selected for this video.
                  </p>
                </div>
                <Badge variant="primary">{pendingMlJob.status}</Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {pendingMlJob.trackIds.map((trackId) => (
                  <div
                    key={trackId}
                    className="grid gap-2 rounded-[1.25rem] bg-[var(--surface-container-low)] p-3"
                  >
                    <Label htmlFor={`track-${trackId}-student`}>Video ID {trackId}</Label>
                    <Select
                      id={`track-${trackId}-student`}
                      value={trackMappings[trackId] ?? ""}
                      onChange={(event) => {
                        setTrackMappings((current) => ({
                          ...current,
                          [trackId]: event.target.value,
                        }));
                      }}
                    >
                      <option value="">Select student</option>
                      {classStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.studentId ? `${student.studentId} - ` : ""}
                          {student.fullName}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  size="sm"
                  disabled={isSavingMappings || pendingMlJob.trackIds.length === 0}
                  onClick={() => void saveTrackMappings()}
                >
                  <Check />
                  {isSavingMappings ? "Saving..." : "Save matches"}
                </Button>
              </div>
            </div>
          ) : null}
        </DashboardSectionCard>
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
            {recordings.map((recording) => (
              <RecordingCard
                key={recording.id}
                recording={recording}
                recordingAccessState={
                  recordingAccessStates[recording.id] ?? DEFAULT_ASSET_ACCESS_STATE
                }
                snapshotAccessState={
                  recording.snapshot
                    ? snapshotAccessStates[recording.snapshot.id] ??
                      DEFAULT_ASSET_ACCESS_STATE
                    : DEFAULT_ASSET_ACCESS_STATE
                }
                onRequestRecordingAccess={(recordingId, action) => {
                  void requestAccess("recording", recordingId, action);
                }}
                onRequestSnapshotAccess={(snapshotId, action) => {
                  if (!snapshotId) {
                    return;
                  }

                  void requestAccess("snapshot", snapshotId, action);
                }}
                onDeleteRecording={(recordingId) => {
                  void deleteRecording(recordingId);
                }}
                isDeletingRecording={deletingRecordingId === recording.id}
              />
            ))}
          </div>
        )}
        </DashboardSectionCard>
      ) : null}

      <Modal
        open={Boolean(mlInitResponse)}
        onClose={() => {
          if (isUploadingMlVideo) {
            return;
          }

          setMlInitResponse(null);
          setRoiBoxes([]);
          setDraftRoi(null);
          setImageBounds(null);
          setPairWatchTrackIds(["", ""]);
        }}
        eyebrow="ML setup"
        title="Mark children on the first frame"
        description="Draw one box per child, match each video ID to a student, and optionally set a pair watch before ML processing starts."
        className="max-w-5xl"
      >
        {mlInitResponse ? (
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface-container-low)] p-4">
              <div
                ref={imageContainerRef}
                className="relative overflow-hidden rounded-[1rem] border border-[var(--panel-border)] bg-black"
                onMouseDown={(event) => {
                  if (event.button !== 0) {
                    return;
                  }

                  startRoiDraft(event.clientX, event.clientY);
                }}
                onMouseMove={(event) => {
                  if (!pointerStartRef.current) {
                    return;
                  }

                  updateRoiDraft(event.clientX, event.clientY);
                }}
                onMouseUp={() => {
                  finishRoiDraft();
                }}
                onMouseLeave={() => {
                  if (pointerStartRef.current) {
                    finishRoiDraft();
                  }
                }}
              >
                <img
                  ref={imageRef}
                  src={mlInitResponse.firstFrame.mediaUrl}
                  alt="First frame for student selection"
                  className="block max-h-[70vh] w-full object-contain"
                  onLoad={() => {
                    syncImageBounds();
                  }}
                />

                {imageBounds
                  ? roiBoxes.map((box, index) => {
                      const scaleX = imageBounds.width / mlInitResponse.frameWidth;
                      const scaleY = imageBounds.height / mlInitResponse.frameHeight;
                      return (
                        <div
                          key={box.id}
                          className="absolute border-2 border-sky-400 bg-sky-400/10"
                          style={{
                            left: imageBounds.left + box.x * scaleX,
                            top: imageBounds.top + box.y * scaleY,
                            width: box.width * scaleX,
                            height: box.height * scaleY,
                          }}
                        >
                          <div className="absolute left-1 top-1 rounded-full bg-sky-500 px-2 py-1 text-xs font-semibold text-white">
                            ID {index + 1}
                          </div>
                        </div>
                      );
                    })
                  : null}

                {draftRoi ? (
                  <div
                    className="absolute border-2 border-dashed border-amber-400 bg-amber-300/10"
                    style={{
                      left: (imageBounds?.left ?? 0) + draftRoi.x,
                      top: (imageBounds?.top ?? 0) + draftRoi.y,
                      width: draftRoi.width,
                      height: draftRoi.height,
                    }}
                  />
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] bg-[var(--surface-container-low)] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--on-surface)]">
                  Selected video IDs
                </p>
                <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                  Each box becomes a temporary ML ID. Match each ID to a student before processing.
                </p>
                <div className="mt-3 grid gap-3">
                  {roiBoxes.length > 0 ? (
                    roiBoxes.map((box, index) => (
                      <div
                        key={box.id}
                        className="grid gap-2 rounded-[1.25rem] bg-[var(--surface-container-lowest)] p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-[var(--on-surface)]">
                            ID {index + 1}
                          </span>
                          <button
                            type="button"
                            className="rounded-full p-1 text-[var(--on-surface-variant)] hover:bg-[var(--hover-overlay)]"
                            onClick={() => {
                              setRoiBoxes((current) =>
                                current.filter((item) => item.id !== box.id),
                              );
                              setTrackMappings((current) => {
                                const next = { ...current };
                                delete next[index + 1];
                                return next;
                              });
                              setPairWatchTrackIds((current) => [
                                current[0] === String(index + 1) ? "" : current[0],
                                current[1] === String(index + 1) ? "" : current[1],
                              ]);
                            }}
                            aria-label={`Remove box ${index + 1}`}
                          >
                            <Minus className="size-4" />
                          </button>
                        </div>
                        <Select
                          value={trackMappings[index + 1] ?? ""}
                          onChange={(event) => {
                            const studentId = event.target.value;
                            setTrackMappings((current) => ({
                              ...current,
                              [index + 1]: studentId,
                            }));
                          }}
                        >
                          <option value="">Select student</option>
                          {classStudents.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.studentId ? `${student.studentId} - ` : ""}
                              {student.fullName}
                            </option>
                          ))}
                        </Select>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--on-surface-variant)]">
                      No child selected yet.
                    </p>
                  )}
                </div>

                {roiBoxes.length >= 2 ? (
                  <div className="mt-5 grid gap-3 rounded-[1.25rem] bg-[var(--surface-container-lowest)] p-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--on-surface)]">
                        Pair watch
                      </p>
                      <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                        Pick two video IDs to watch for close-contact alerts in this training run.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Select
                        value={pairWatchTrackIds[0]}
                        onChange={(event) => {
                          setPairWatchTrackIds((current) => [
                            event.target.value,
                            current[1],
                          ]);
                        }}
                      >
                        <option value="">Pair watch child 1</option>
                        {roiBoxes.map((_, index) => (
                          <option key={`pair-a-${index + 1}`} value={String(index + 1)}>
                            Video ID {index + 1}
                          </option>
                        ))}
                      </Select>
                      <Select
                        value={pairWatchTrackIds[1]}
                        onChange={(event) => {
                          setPairWatchTrackIds((current) => [
                            current[0],
                            event.target.value,
                          ]);
                        }}
                      >
                        <option value="">Pair watch child 2</option>
                        {roiBoxes.map((_, index) => (
                          <option key={`pair-b-${index + 1}`} value={String(index + 1)}>
                            Video ID {index + 1}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isUploadingMlVideo || roiBoxes.length === 0}
                  onClick={() => {
                    setRoiBoxes((current) => current.slice(0, -1));
                  }}
                >
                  <Minus />
                  Remove last
                </Button>
                <Button
                  type="button"
                  disabled={isUploadingMlVideo || roiBoxes.length === 0}
                  onClick={() => void processMlVideoWithRois()}
                >
                  <Check />
                  {isUploadingMlVideo ? "Processing..." : "Start ML processing"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </DashboardPage>
  );
}
