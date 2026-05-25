"use client";

import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, Minus, Square, Video } from "lucide-react";

import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { useMlProcessing } from "@/components/providers/ml-processing-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type {
  TeacherAlertWatchPair,
  TeacherMlLiveSessionStartResponse,
  TeacherMlRoiBox,
  TeacherStudent,
} from "@/types/teacher";

const LIVE_RECORDING_CHUNK_MS = 3000;

type DrawingBox = TeacherMlRoiBox & {
  id: string;
};

type TeacherLiveRecordingPanelProps = {
  classId: string;
  onRecordingProcessed?: () => void;
};

function derivePairWatchTrackIds(
  watchPair: TeacherAlertWatchPair | null,
  mappings: Array<{ trackId: number; studentId: string }>,
) {
  if (!watchPair?.isActive) {
    return [];
  }

  const firstMapping = mappings.find(
    (mapping) => mapping.studentId === watchPair.firstStudentId,
  );
  const secondMapping = mappings.find(
    (mapping) => mapping.studentId === watchPair.secondStudentId,
  );

  if (!firstMapping || !secondMapping) {
    return [];
  }

  return [firstMapping.trackId, secondMapping.trackId];
}

export function TeacherLiveRecordingPanel({
  classId,
  onRecordingProcessed,
}: TeacherLiveRecordingPanelProps) {
  const toast = useToast();
  const mlProcessing = useMlProcessing();
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOpening, setIsCameraOpening] = useState(false);
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
  const [isPreparingLiveMl, setIsPreparingLiveMl] = useState(false);
  const [liveMlError, setLiveMlError] = useState<string | null>(null);
  const [liveMlMessage, setLiveMlMessage] = useState<string | null>(null);
  const [liveMlInitResponse, setLiveMlInitResponse] =
    useState<TeacherMlLiveSessionStartResponse | null>(null);
  const [liveRoiBoxes, setLiveRoiBoxes] = useState<DrawingBox[]>([]);
  const [liveDraftRoi, setLiveDraftRoi] = useState<TeacherMlRoiBox | null>(null);
  const [liveImageBounds, setLiveImageBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [liveClassStudents, setLiveClassStudents] = useState<TeacherStudent[]>([]);
  const [liveTrackMappings, setLiveTrackMappings] = useState<Record<number, string>>({});
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [lastRecordingObjectKey, setLastRecordingObjectKey] = useState<
    string | null
  >(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<string | null>(null);
  const liveSessionIdRef = useRef<string | null>(null);
  const liveChunkSequenceRef = useRef(0);
  const liveChunkUploadsRef = useRef<Promise<unknown>[]>([]);
  const liveChunkUploadChainRef = useRef<Promise<unknown>>(Promise.resolve());
  const liveRoisRef = useRef<TeacherMlRoiBox[]>([]);
  const liveMappingsRef = useRef<Array<{ trackId: number; studentId: string }>>([]);
  const livePairWatchTrackIdsRef = useRef<number[]>([]);
  const liveImageContainerRef = useRef<HTMLDivElement | null>(null);
  const liveImageRef = useRef<HTMLImageElement | null>(null);
  const livePointerStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function loadCameraDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      toast.error("Camera devices are not available in this browser.");
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    setCameraDevices(videoDevices);

    if (!selectedDeviceId && videoDevices[0]?.deviceId) {
      setSelectedDeviceId(videoDevices[0].deviceId);
    }

    return videoDevices;
  }

  async function openCameraPreview() {
    try {
      setIsCameraOpening(true);
      await loadCameraDevices();
      streamRef.current?.getTracks().forEach((track) => track.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : true,
        audio: false,
      });

      streamRef.current = stream;
      setIsPreviewActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      await loadCameraDevices();
    } catch (cameraError) {
      toast.error(getApiErrorMessage(cameraError));
    } finally {
      setIsCameraOpening(false);
    }
  }

  async function loadAllClassStudents() {
    const response = await teacherService.getClassStudents(classId, {
      limit: 100,
    });
    setLiveClassStudents(response.items);
    return response.items;
  }

  function captureCurrentFrame() {
    return new Promise<Blob>((resolve, reject) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error("Camera preview is not ready yet."));
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Could not read the camera frame."));
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Could not create a first-frame image."));
          return;
        }

        resolve(blob);
      }, "image/png");
    });
  }

  async function startLiveMlSetup() {
    if (!streamRef.current) {
      toast.error("Open the camera preview before recording.");
      return;
    }

    try {
      setIsPreparingLiveMl(true);
      setLiveMlError(null);
      setLiveMlMessage("Preparing live ML setup from the current camera frame.");
      setLiveMlInitResponse(null);
      setLiveRoiBoxes([]);
      setLiveDraftRoi(null);
      setLiveImageBounds(null);
      setLiveTrackMappings({});

      const [firstFrame] = await Promise.all([
        captureCurrentFrame(),
        loadAllClassStudents(),
      ]);
      const initResponse = await teacherService.startLiveMlSession({ firstFrame });
      setLiveMlInitResponse(initResponse);
      setLiveMlMessage("Select each child once. Recording will start after matches are saved.");
    } catch (error) {
      setLiveMlError(getApiErrorMessage(error));
      setLiveMlMessage(null);
    } finally {
      setIsPreparingLiveMl(false);
    }
  }

  function beginLiveBrowserRecording() {
    const stream = streamRef.current;

    if (!stream) {
      toast.error("Open the camera preview before recording.");
      return;
    }

    recordingChunksRef.current = [];
    recordingStartedAtRef.current = new Date().toISOString();
    liveChunkSequenceRef.current = 0;
    liveChunkUploadsRef.current = [];
    liveChunkUploadChainRef.current = Promise.resolve();
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordingChunksRef.current.push(event.data);
        const sessionId = liveSessionIdRef.current;
        if (sessionId) {
          const sequence = liveChunkSequenceRef.current;
          liveChunkSequenceRef.current += 1;
          const uploadPromise = liveChunkUploadChainRef.current.then(() =>
            teacherService.uploadLiveMlChunk({
              sessionId,
              sequence,
              blob: event.data,
            }),
          );
          const safeUploadPromise = uploadPromise.catch((error) => {
            setLiveMlError(getApiErrorMessage(error));
          });
          liveChunkUploadChainRef.current = safeUploadPromise;
          liveChunkUploadsRef.current.push(safeUploadPromise);
        }
      }
    };
    recorder.onstop = () => {
      void finalizeLiveRecording();
    };

    mediaRecorderRef.current = recorder;
    recorder.start(LIVE_RECORDING_CHUNK_MS);
    setIsRecording(true);
    setLiveMlMessage("Recording is active. Video chunks are being sent to ML while recording continues.");
  }

  function stopBrowserRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  async function startLiveRecordingAfterSetup() {
    if (!liveMlInitResponse || liveRoiBoxes.length === 0) {
      return;
    }

    const mappings = liveRoiBoxes.map((_, index) => ({
      trackId: index + 1,
      studentId: liveTrackMappings[index + 1] ?? "",
    }));
    const missingMapping = mappings.find((mapping) => !mapping.studentId);

    if (missingMapping) {
      setLiveMlError(`Select a student for Video ID ${missingMapping.trackId}.`);
      return;
    }

    liveSessionIdRef.current = liveMlInitResponse.sessionId;
    liveRoisRef.current = liveRoiBoxes.map(({ x, y, width, height }) => ({
      x,
      y,
      width,
      height,
    }));
    liveMappingsRef.current = mappings;

    try {
      setIsPreparingLiveMl(true);
      setLiveMlError(null);
      setLiveMlMessage("Starting live ML processing. Each chunk will be processed while recording continues.");
      const watchPair = await teacherService.getAlertWatchPair(classId);
      livePairWatchTrackIdsRef.current = derivePairWatchTrackIds(
        watchPair,
        mappings,
      );
      await teacherService.configureLiveMlSession({
        sessionId: liveMlInitResponse.sessionId,
        rois: liveRoisRef.current,
        pairWatchTrackIds: livePairWatchTrackIdsRef.current,
      });
    } catch (error) {
      setLiveMlError(getApiErrorMessage(error));
      setLiveMlMessage(null);
      setIsPreparingLiveMl(false);
      return;
    }

    setLiveMlInitResponse(null);
    setLiveRoiBoxes([]);
    setLiveDraftRoi(null);
    setLiveImageBounds(null);
    setLiveMlError(null);
    setIsPreparingLiveMl(false);
    beginLiveBrowserRecording();
  }

  async function finalizeLiveRecording() {
    const startedAt = recordingStartedAtRef.current;
    const endedAt = new Date().toISOString();
    const sessionId = liveSessionIdRef.current;

    if (!startedAt || !sessionId || recordingChunksRef.current.length === 0) {
      setIsRecording(false);
      toast.error("No recording data was captured.");
      return;
    }

    const progressJobId = mlProcessing.startJob({
      title: "Live ML processing",
      detail: "Finalizing live camera chunks and generating the report.",
    });

    try {
      setIsUploadingRecording(true);
      setLiveMlError(null);
      setLiveMlMessage("Finalizing live ML recording.");
      await Promise.all(liveChunkUploadsRef.current);

      mlProcessing.updateJob(progressJobId, "Combining live processed chunk results.", 80);

      const mlResponse = await teacherService.finalizeLiveMlSession({
        sessionId,
        startedAt,
        endedAt,
        rois: liveRoisRef.current,
        pairWatchTrackIds: livePairWatchTrackIdsRef.current,
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
        mappings: liveMappingsRef.current,
      });

      setLastRecordingObjectKey(mlResponse.recording.objectKey);
      setLiveMlMessage("Live recording processed. Reports are ready in child profiles.");
      mlProcessing.completeJob(progressJobId, "Live ML processing completed.");
      toast.success("Live recording processed and matched to students.");
      onRecordingProcessed?.();
    } catch (recordingError) {
      const message = getApiErrorMessage(recordingError);
      setLiveMlError(message);
      mlProcessing.failJob(progressJobId, message);
      toast.error(message);
    } finally {
      recordingChunksRef.current = [];
      recordingStartedAtRef.current = null;
      liveSessionIdRef.current = null;
      liveChunkUploadsRef.current = [];
      liveChunkUploadChainRef.current = Promise.resolve();
      liveRoisRef.current = [];
      liveMappingsRef.current = [];
      livePairWatchTrackIdsRef.current = [];
      setIsRecording(false);
      setIsUploadingRecording(false);
    }
  }

  function syncLiveImageBounds() {
    if (!liveImageRef.current || !liveImageContainerRef.current) {
      return;
    }

    const containerBounds = liveImageContainerRef.current.getBoundingClientRect();
    const imageBounds = liveImageRef.current.getBoundingClientRect();

    setLiveImageBounds({
      left: imageBounds.left - containerBounds.left,
      top: imageBounds.top - containerBounds.top,
      width: imageBounds.width,
      height: imageBounds.height,
    });
  }

  function toLiveNaturalBox(box: TeacherMlRoiBox) {
    if (!liveMlInitResponse || !liveImageBounds) {
      return box;
    }

    const scaleX = liveMlInitResponse.frameWidth / liveImageBounds.width;
    const scaleY = liveMlInitResponse.frameHeight / liveImageBounds.height;

    return {
      x: Math.round(box.x * scaleX),
      y: Math.round(box.y * scaleY),
      width: Math.round(box.width * scaleX),
      height: Math.round(box.height * scaleY),
    };
  }

  function getLiveRelativePoint(clientX: number, clientY: number) {
    if (!liveImageRef.current) {
      return null;
    }

    const bounds = liveImageRef.current.getBoundingClientRect();
    const rawX = clientX - bounds.left;
    const rawY = clientY - bounds.top;

    if (rawX < 0 || rawY < 0 || rawX > bounds.width || rawY > bounds.height) {
      return null;
    }

    const x = Math.max(0, Math.min(rawX, bounds.width));
    const y = Math.max(0, Math.min(rawY, bounds.height));

    return { x, y, width: bounds.width, height: bounds.height };
  }

  function startLiveRoiDraft(clientX: number, clientY: number) {
    const point = getLiveRelativePoint(clientX, clientY);
    if (!point) {
      return;
    }

    livePointerStartRef.current = { x: point.x, y: point.y };
    setLiveImageBounds((current) =>
      current
        ? current
        : { left: 0, top: 0, width: point.width, height: point.height },
    );
    setLiveDraftRoi({ x: point.x, y: point.y, width: 0, height: 0 });
  }

  function updateLiveRoiDraft(clientX: number, clientY: number) {
    const start = livePointerStartRef.current;
    const point = getLiveRelativePoint(clientX, clientY);
    if (!start || !point) {
      return;
    }

    const left = Math.min(start.x, point.x);
    const top = Math.min(start.y, point.y);
    const width = Math.abs(point.x - start.x);
    const height = Math.abs(point.y - start.y);

    setLiveDraftRoi({ x: left, y: top, width, height });
  }

  function finishLiveRoiDraft() {
    if (!liveDraftRoi) {
      livePointerStartRef.current = null;
      return;
    }

    if (liveDraftRoi.width >= 12 && liveDraftRoi.height >= 12) {
      const naturalBox = toLiveNaturalBox(liveDraftRoi);
      setLiveRoiBoxes((current) => [
        ...current,
        { id: crypto.randomUUID(), ...naturalBox },
      ]);
    }

    livePointerStartRef.current = null;
    setLiveDraftRoi(null);
  }

  useEffect(() => {
    if (!liveMlInitResponse) {
      return;
    }

    syncLiveImageBounds();

    function handleResize() {
      syncLiveImageBounds();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [liveMlInitResponse]);

  return (
    <>
      <DashboardSectionCard
        eyebrow="Class camera"
        title="Camera recording"
        description="Record a classroom session, mark each child from the first frame, and send live chunks through the ML pipeline."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isCameraOpening || isRecording || isUploadingRecording || isPreparingLiveMl}
              onClick={() => {
                void openCameraPreview();
              }}
            >
              {isCameraOpening ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Video />
              )}
              {isCameraOpening ? "Opening..." : "Open camera"}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={
                !isPreviewActive || isUploadingRecording || isCameraOpening || isPreparingLiveMl
              }
              onClick={() => {
                if (isRecording) {
                  stopBrowserRecording();
                } else {
                  void startLiveMlSetup();
                }
              }}
            >
              {isUploadingRecording || isPreparingLiveMl ? (
                <LoaderCircle className="animate-spin" />
              ) : isRecording ? (
                <Square />
              ) : (
                <Video />
              )}
              {isPreparingLiveMl
                ? "Preparing..."
                : isUploadingRecording
                  ? "Processing..."
                  : isRecording
                    ? "Stop recording"
                    : "Start recording"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.75fr)]">
          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--panel-border)] bg-black">
            <video
              ref={videoRef}
              className="aspect-video w-full object-cover"
              autoPlay
              muted
              playsInline
            />
          </div>
          <div className="grid gap-3 rounded-[1.5rem] bg-[var(--surface-container-low)] p-4 text-sm text-[var(--on-surface-variant)]">
            <div className="grid gap-2">
              <Label htmlFor="recordings-live-camera-source">Camera source</Label>
              <select
                id="recordings-live-camera-source"
                className="min-h-11 rounded-[1rem] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3 text-sm text-[var(--on-surface)]"
                value={selectedDeviceId}
                disabled={isRecording || isUploadingRecording}
                onChange={(event) => {
                  setSelectedDeviceId(event.target.value);
                }}
              >
                {cameraDevices.length === 0 ? (
                  <option value="">Default camera</option>
                ) : (
                  cameraDevices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))
                )}
              </select>
            </div>
            <p>
              {isRecording
                ? "Recording is active. Chunks are being sent to ML while recording continues."
                : isPreviewActive
                  ? "Preview is active. Start recording to select IDs and begin live ML."
                  : "Open the camera to preview the selected source."}
            </p>
            {liveMlMessage ? (
              <p className="text-[var(--on-surface)]">{liveMlMessage}</p>
            ) : null}
            {liveMlError ? <MutationFeedback message={liveMlError} /> : null}
            {lastRecordingObjectKey ? (
              <p className="break-words">
                Last recording: {lastRecordingObjectKey}
              </p>
            ) : null}
          </div>
        </div>
      </DashboardSectionCard>

      <Modal
        open={Boolean(liveMlInitResponse)}
        onClose={() => {
          if (isRecording || isUploadingRecording) {
            return;
          }

          setLiveMlInitResponse(null);
          setLiveRoiBoxes([]);
          setLiveDraftRoi(null);
          setLiveImageBounds(null);
        }}
        eyebrow="Live ML setup"
        title="Mark children before recording starts"
        description="Draw one box per child and match each video ID to a student. The saved alert watch pair is applied automatically."
        className="max-w-5xl"
      >
        {liveMlInitResponse ? (
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface-container-low)] p-4">
              <div
                ref={liveImageContainerRef}
                className="relative overflow-hidden rounded-[1rem] border border-[var(--panel-border)] bg-black"
                onMouseDown={(event) => {
                  if (event.button !== 0) {
                    return;
                  }

                  startLiveRoiDraft(event.clientX, event.clientY);
                }}
                onMouseMove={(event) => {
                  if (!livePointerStartRef.current) {
                    return;
                  }

                  updateLiveRoiDraft(event.clientX, event.clientY);
                }}
                onMouseUp={() => {
                  finishLiveRoiDraft();
                }}
                onMouseLeave={() => {
                  if (livePointerStartRef.current) {
                    finishLiveRoiDraft();
                  }
                }}
              >
                <img
                  ref={liveImageRef}
                  src={liveMlInitResponse.firstFrame.mediaUrl}
                  alt="Live first frame for student selection"
                  className="block max-h-[70vh] w-full object-contain"
                  onLoad={() => {
                    syncLiveImageBounds();
                  }}
                />

                {liveImageBounds
                  ? liveRoiBoxes.map((box, index) => {
                      const scaleX = liveImageBounds.width / liveMlInitResponse.frameWidth;
                      const scaleY = liveImageBounds.height / liveMlInitResponse.frameHeight;
                      return (
                        <div
                          key={box.id}
                          className="absolute border-2 border-sky-400 bg-sky-400/10"
                          style={{
                            left: liveImageBounds.left + box.x * scaleX,
                            top: liveImageBounds.top + box.y * scaleY,
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

                {liveDraftRoi ? (
                  <div
                    className="absolute border-2 border-dashed border-amber-400 bg-amber-300/10"
                    style={{
                      left: (liveImageBounds?.left ?? 0) + liveDraftRoi.x,
                      top: (liveImageBounds?.top ?? 0) + liveDraftRoi.y,
                      width: liveDraftRoi.width,
                      height: liveDraftRoi.height,
                    }}
                  />
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] bg-[var(--surface-container-low)] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--on-surface)]">
                  Live video IDs
                </p>
                <div className="mt-3 grid gap-3">
                  {liveRoiBoxes.length > 0 ? (
                    liveRoiBoxes.map((box, index) => (
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
                              setLiveRoiBoxes((current) =>
                                current.filter((item) => item.id !== box.id),
                              );
                              setLiveTrackMappings((current) => {
                                const next = { ...current };
                                delete next[index + 1];
                                return next;
                              });
                            }}
                            aria-label={`Remove box ${index + 1}`}
                          >
                            <Minus className="size-4" />
                          </button>
                        </div>
                        <Select
                          value={liveTrackMappings[index + 1] ?? ""}
                          onChange={(event) => {
                            setLiveTrackMappings((current) => ({
                              ...current,
                              [index + 1]: event.target.value,
                            }));
                          }}
                        >
                          <option value="">Select student</option>
                          {liveClassStudents.map((student) => (
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
                {liveMlError ? (
                  <MutationFeedback className="mt-4" message={liveMlError} />
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={liveRoiBoxes.length === 0}
                  onClick={() => {
                    setLiveRoiBoxes((current) => current.slice(0, -1));
                  }}
                >
                  <Minus />
                  Remove last
                </Button>
                <Button
                  type="button"
                  disabled={liveRoiBoxes.length === 0}
                  onClick={() => void startLiveRecordingAfterSetup()}
                >
                  <Check />
                  Start live recording
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
