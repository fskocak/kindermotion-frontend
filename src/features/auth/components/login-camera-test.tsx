"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";

export function LoginCameraTest() {
  const [open, setOpen] = useState(false);
  const [isCameraOpening, setIsCameraOpening] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [message, setMessage] = useState("Select a source and open the camera.");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCameraPreview = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsPreviewActive(false);
  }, []);

  const loadCameraDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setMessage("Camera devices are not available in this browser.");
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    setCameraDevices(videoDevices);

    if (!selectedDeviceId && videoDevices[0]?.deviceId) {
      setSelectedDeviceId(videoDevices[0].deviceId);
    }

    return videoDevices;
  }, [selectedDeviceId]);

  useEffect(() => {
    if (!open) {
      stopCameraPreview();
      return;
    }

    void loadCameraDevices();

    return () => {
      stopCameraPreview();
    };
  }, [loadCameraDevices, open, stopCameraPreview]);

  async function openCameraPreview(deviceId = selectedDeviceId) {
    try {
      setIsCameraOpening(true);
      setMessage("Opening camera...");
      await loadCameraDevices();
      stopCameraPreview();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      });

      streamRef.current = stream;
      setIsPreviewActive(true);
      setMessage("Camera preview is active.");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      await loadCameraDevices();
    } catch (error) {
      setMessage(getApiErrorMessage(error));
      setIsPreviewActive(false);
    } finally {
      setIsCameraOpening(false);
    }
  }

  function closeCameraTest() {
    stopCameraPreview();
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Camera />
        Test camera
      </Button>

      <Modal
        open={open}
        onClose={closeCameraTest}
        eyebrow="Camera Check"
        title="Test camera"
        description="Preview only. Nothing is recorded or uploaded."
        className="max-w-2xl"
      >
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--panel-border)] bg-black">
            <video
              ref={videoRef}
              className="aspect-video w-full object-cover"
              autoPlay
              muted
              playsInline
            />
          </div>

          <div className="grid gap-3 rounded-[1.5rem] bg-[var(--surface-container-low)] p-4">
            <div className="grid gap-2">
              <Label htmlFor="login-camera-source">Camera source</Label>
              <Select
                id="login-camera-source"
                value={selectedDeviceId}
                disabled={isCameraOpening}
                onChange={(event) => {
                  const deviceId = event.target.value;
                  setSelectedDeviceId(deviceId);

                  if (isPreviewActive) {
                    void openCameraPreview(deviceId);
                  }
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
              </Select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--on-surface-variant)]">
                {message}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isCameraOpening}
                  onClick={() => {
                    void openCameraPreview();
                  }}
                >
                  {isCameraOpening ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Camera />
                  )}
                  {isCameraOpening ? "Opening..." : "Open camera"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!isPreviewActive}
                  onClick={() => {
                    stopCameraPreview();
                    setMessage("Camera preview stopped.");
                  }}
                >
                  <Square />
                  Stop
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
