"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Square, Video } from "lucide-react";

import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";

type TeacherCameraRecordingPanelProps = {
  onRecordingUploaded?: () => void;
};

export function TeacherCameraRecordingPanel({
  onRecordingUploaded,
}: TeacherCameraRecordingPanelProps) {
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOpening, setIsCameraOpening] = useState(false);
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
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

  function startBrowserRecording() {
    const stream = streamRef.current;

    if (!stream) {
      toast.error("Open the camera preview before recording.");
      return;
    }

    recordingChunksRef.current = [];
    recordingStartedAtRef.current = new Date().toISOString();
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordingChunksRef.current.push(event.data);
      }
    };
    recorder.onstop = () => {
      void uploadStoppedRecording();
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }

  function stopBrowserRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  async function uploadStoppedRecording() {
    const startedAt = recordingStartedAtRef.current;
    const endedAt = new Date().toISOString();

    if (!startedAt || recordingChunksRef.current.length === 0) {
      setIsRecording(false);
      toast.error("No recording data was captured.");
      return;
    }

    try {
      setIsUploadingRecording(true);
      const blob = new Blob(recordingChunksRef.current, { type: "video/webm" });
      const result = await teacherService.uploadBrowserRecording({
        blob,
        startedAt,
        endedAt,
      });
      setLastRecordingObjectKey(result.recording.objectKey);
      toast.success("Recording uploaded and sent to backend.");
      onRecordingUploaded?.();
    } catch (recordingError) {
      toast.error(getApiErrorMessage(recordingError));
    } finally {
      recordingChunksRef.current = [];
      recordingStartedAtRef.current = null;
      setIsRecording(false);
      setIsUploadingRecording(false);
    }
  }

  return (
    <DashboardSectionCard
      eyebrow="Camera"
      title="Camera recording"
      description="Record a browser camera session and send it to the backend. Uploaded results appear in the recordings list once the backend exposes them."
      actions={
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isCameraOpening || isRecording || isUploadingRecording}
            onClick={() => {
              void openCameraPreview();
            }}
          >
            {isCameraOpening ? <LoaderCircle className="animate-spin" /> : <Video />}
            {isCameraOpening ? "Opening..." : "Open camera"}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!isPreviewActive || isUploadingRecording || isCameraOpening}
            onClick={() => {
              if (isRecording) {
                stopBrowserRecording();
              } else {
                startBrowserRecording();
              }
            }}
          >
            {isUploadingRecording ? (
              <LoaderCircle className="animate-spin" />
            ) : isRecording ? (
              <Square />
            ) : (
              <Video />
            )}
            {isUploadingRecording
              ? "Uploading..."
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
            <Label htmlFor="recordings-camera-source">Camera source</Label>
            <select
              id="recordings-camera-source"
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
              ? "Recording is active. Stop recording to upload it."
              : isPreviewActive
                ? "Preview is active. Start recording when ready."
                : "Open the camera to preview the selected source."}
          </p>
          {lastRecordingObjectKey ? (
            <p className="break-words">Last recording: {lastRecordingObjectKey}</p>
          ) : null}
        </div>
      </div>
    </DashboardSectionCard>
  );
}
