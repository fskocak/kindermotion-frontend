"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, FileVideo, Minus, Upload } from "lucide-react";

import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { useMlProcessing } from "@/components/providers/ml-processing-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type {
  TeacherMlRoiBox,
  TeacherMlVideoInitResponse,
  TeacherStudent,
} from "@/types/teacher";

type DrawingBox = TeacherMlRoiBox & {
  id: string;
};

type TeacherMlUploadCardProps = {
  classId: string;
  onCompleted?: () => Promise<void> | void;
};

export function TeacherMlUploadCard({
  classId,
  onCompleted,
}: TeacherMlUploadCardProps) {
  const [mlVideoFile, setMlVideoFile] = useState<File | null>(null);
  const [isUploadingMlVideo, setIsUploadingMlVideo] = useState(false);
  const [mlUploadMessage, setMlUploadMessage] = useState<string | null>(null);
  const [mlUploadError, setMlUploadError] = useState<string | null>(null);
  const [mlInitResponse, setMlInitResponse] =
    useState<TeacherMlVideoInitResponse | null>(null);
  const [roiBoxes, setRoiBoxes] = useState<DrawingBox[]>([]);
  const [draftRoi, setDraftRoi] = useState<TeacherMlRoiBox | null>(null);
  const [imageBounds, setImageBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [classStudents, setClassStudents] = useState<TeacherStudent[]>([]);
  const [trackMappings, setTrackMappings] = useState<Record<number, string>>({});
  const [pairWatchTrackIds, setPairWatchTrackIds] = useState<[string, string]>([
    "",
    "",
  ]);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const mlProcessing = useMlProcessing();

  const loadClassStudents = useCallback(async () => {
    if (!classId) {
      setClassStudents([]);
      return [];
    }

    const response = await teacherService.getClassStudents(classId, {
      limit: 100,
    });
    setClassStudents(response.items);
    return response.items;
  }, [classId]);

  async function uploadMlVideo() {
    if (!mlVideoFile || !classId) {
      return;
    }

    const now = new Date();
    setIsUploadingMlVideo(true);
    setMlUploadError(null);
    setMlUploadMessage("Video is uploading. First frame will open here for ID selection.");
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
      setMlUploadMessage(
        "Draw a box around each child on the first frame, then start ML processing.",
      );
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

    const currentInitResponse = mlInitResponse;
    const currentRoiBoxes = roiBoxes.map(({ x, y, width, height }) => ({
      x,
      y,
      width,
      height,
    }));
    const currentPairWatchTrackIds = pairWatchTrackIds
      .filter(Boolean)
      .map((value) => Number(value));

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
    setMlUploadMessage("ML processing is running in the background.");
    setMlInitResponse(null);
    setRoiBoxes([]);
    setDraftRoi(null);
    setImageBounds(null);

    const progressJobId = mlProcessing.startJob({
      title: "ML video processing",
      detail: "Running the uploaded classroom video through the ML pipeline.",
    });

    try {
      const mlResponse = await teacherService.processMlVideo({
        recordingKey: currentInitResponse.recording.recordingKey,
        objectKey: currentInitResponse.recording.objectKey,
        rois: currentRoiBoxes,
        pairWatchTrackIds: currentPairWatchTrackIds,
      });

      mlProcessing.updateJob(
        progressJobId,
        "Saving processed video, report PDF, and prediction CSV.",
        88,
      );

      const job = await teacherService.createMlProcessingJob({
        recordingKey: mlResponse.recording.recordingKey,
        runId: mlResponse.runId,
        status: mlResponse.status,
        trackIds: mlResponse.trackIds,
        artifacts: mlResponse.artifacts,
        errorMessage: mlResponse.errorMessage,
      });

      mlProcessing.updateJob(
        progressJobId,
        "Matching video IDs to classroom students.",
        94,
      );

      await teacherService.updateMlTrackMappings(job.id, {
        mappings: mappings.map((mapping) => ({
          trackId: mapping.trackId,
          studentId: mapping.studentId,
        })),
      });

      setMlVideoFile(null);
      setTrackMappings({});
      setPairWatchTrackIds(["", ""]);
      setMlUploadMessage("ML processing completed and IDs were matched to classroom students.");
      mlProcessing.completeJob(
        progressJobId,
        "ML processing completed. Reports and matched student records are ready.",
      );
      await onCompleted?.();
    } catch (error) {
      const message = getApiErrorMessage(error);
      setMlUploadError(message);
      setMlUploadMessage(null);
      mlProcessing.failJob(progressJobId, message);
    } finally {
      setIsUploadingMlVideo(false);
    }
  }

  function syncImageBounds() {
    if (!imageRef.current || !imageContainerRef.current) {
      return;
    }

    const containerBounds = imageContainerRef.current.getBoundingClientRect();
    const currentImageBounds = imageRef.current.getBoundingClientRect();

    setImageBounds({
      left: currentImageBounds.left - containerBounds.left,
      top: currentImageBounds.top - containerBounds.top,
      width: currentImageBounds.width,
      height: currentImageBounds.height,
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
    setMlVideoFile(null);
    setMlUploadMessage(null);
    setMlUploadError(null);
    setMlInitResponse(null);
    setRoiBoxes([]);
    setDraftRoi(null);
    setImageBounds(null);
    setTrackMappings({});
    setPairWatchTrackIds(["", ""]);
    setClassStudents([]);
  }, [classId]);

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

  return (
    <>
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
      </DashboardSectionCard>

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
    </>
  );
}
