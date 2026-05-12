"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, LoaderCircle, Square, Video } from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardPagination } from "@/components/dashboard/dashboard-pagination";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeacherStudentCard } from "@/features/teacher/components/teacher-student-card";
import { TeacherStudentCreateModal } from "@/features/teacher/components/teacher-student-create-modal";
import { TeacherStudentDeleteModal } from "@/features/teacher/components/teacher-student-delete-modal";
import { TeacherStudentDetailModal } from "@/features/teacher/components/teacher-student-detail-modal";
import { TeacherStudentEditModal } from "@/features/teacher/components/teacher-student-edit-modal";
import { formatDateTime } from "@/lib/format/date-time";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { APP_ROUTES } from "@/lib/constants/routes";
import { teacherService } from "@/services";
import type { PaginationMeta } from "@/types/api";
import type { TeacherClass, TeacherStudent } from "@/types/teacher";

type TeacherClassStudentsPageProps = {
  classId: string;
};

const STUDENTS_PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function TeacherClassStudentsPage({
  classId,
}: TeacherClassStudentsPageProps) {
  const toast = useToast();
  const [classContext, setClassContext] = useState<TeacherClass | null>(null);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: STUDENTS_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(
    null,
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  async function loadStudents(page = currentPage, search = debouncedSearch) {
    try {
      setError(null);
      const response = await teacherService.getClassStudents(classId, {
        page,
        limit: STUDENTS_PAGE_LIMIT,
        search,
      });

      if (response.meta.total > 0 && page > response.meta.totalPages) {
        setCurrentPage(response.meta.totalPages);
        return response;
      }

      setClassContext(response.class);
      setStudents(response.items);
      setPaginationMeta(response.meta);
      setSelectedStudent((current) =>
        current
          ? response.items.find((student) => student.id === current.id) ?? null
          : null,
      );

      return response;
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadStudentsOnQueryChange() {
      try {
        setError(null);
        const response = await teacherService.getClassStudents(classId, {
          page: currentPage,
          limit: STUDENTS_PAGE_LIMIT,
          search: debouncedSearch,
        });

        if (!isActive) {
          return;
        }

        if (response.meta.total > 0 && currentPage > response.meta.totalPages) {
          setCurrentPage(response.meta.totalPages);
          return;
        }

        setClassContext(response.class);
        setStudents(response.items);
        setPaginationMeta(response.meta);
        setSelectedStudent((current) =>
          current
            ? response.items.find((student) => student.id === current.id) ?? null
            : null,
        );
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(getApiErrorMessage(loadError));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    void loadStudentsOnQueryChange();

    return () => {
      isActive = false;
    };
  }, [classId, currentPage, debouncedSearch]);

  const hasActiveSearch = debouncedSearch.length > 0;

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
    <DashboardPage
      eyebrow="Teacher / Class Students"
      title={classContext?.name ?? "Class students"}
    >
      <div className="grid gap-6">
        <DashboardSectionCard
          eyebrow="Navigation"
          title="Back to your classes"
          actions={
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={APP_ROUTES.teacherClasses}>Back to My Classes</Link>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsLoading(true);
                  void loadStudents(currentPage, debouncedSearch);
                }}
              >
                Refresh
              </Button>
            </div>
          }
        >
          <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5 text-sm leading-6 text-[var(--on-surface-variant)]">
            {classContext
              ? `Class created ${formatDateTime(classContext.createdAt)}.`
              : "Open a class from the My Classes page to view its students."}
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Class camera"
          title="Camera recording"
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
                  !isPreviewActive || isUploadingRecording || isCameraOpening
                }
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
              <Button asChild variant="outline" size="sm">
                <Link href={APP_ROUTES.teacherRecordings}>
                  <ExternalLink />
                  Open recordings
                </Link>
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
                <Label htmlFor="camera-source">Camera source</Label>
                <select
                  id="camera-source"
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
                <p className="break-words">
                  Last recording: {lastRecordingObjectKey}
                </p>
              ) : null}
            </div>
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Students"
          title="Class students"
          actions={
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setCreateModalOpen(true);
              }}
            >
              Add student
            </Button>
          }
        >
          <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="student-search">Search students</Label>
              <Input
                id="student-search"
                type="search"
                placeholder="Search by student name"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput("");
                setCurrentPage(1);
              }}
              disabled={searchInput.length === 0 && debouncedSearch.length === 0}
            >
              Clear search
            </Button>
          </div>

          {!isLoading && !error ? (
            <div className="mb-5 rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
              {hasActiveSearch
                ? `Showing ${paginationMeta.total} matching student result${paginationMeta.total === 1 ? "" : "s"} for "${debouncedSearch}".`
                : `Showing ${paginationMeta.total} student record${paginationMeta.total === 1 ? "" : "s"} across ${paginationMeta.totalPages} page${paginationMeta.totalPages === 1 ? "" : "s"}.`}
            </div>
          ) : null}

          {isLoading ? (
            <DashboardLoadingState label="Loading class students..." />
          ) : error ? (
            <DashboardErrorState
              title="Could not load class students"
              description={error}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    void loadStudents(currentPage, debouncedSearch);
                  }}
                >
                  Retry
                </Button>
              }
            />
          ) : students.length === 0 && hasActiveSearch ? (
            <DashboardEmptyState
              title="No students match this search"
              description="Try a different student name, or clear the current search to return to the full class roster."
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    setCurrentPage(1);
                  }}
                >
                  Clear search
                </Button>
              }
            />
          ) : students.length === 0 ? (
            <DashboardEmptyState
              title="No students in this class"
              description="Students will appear here once the selected class has enrolled records."
            />
          ) : (
            <div className="grid gap-4">
              {students.map((student) => (
                <TeacherStudentCard
                  key={student.id}
                  student={student}
                  onViewDetails={(item) => {
                    setSelectedStudent(item);
                    setDetailModalOpen(true);
                  }}
                  onEdit={(item) => {
                    setSelectedStudent(item);
                    setEditModalOpen(true);
                  }}
                  onDelete={(item) => {
                    setSelectedStudent(item);
                    setDeleteModalOpen(true);
                  }}
                />
              ))}

              <DashboardPagination
                page={paginationMeta.page}
                totalPages={paginationMeta.totalPages}
                total={paginationMeta.total}
                itemLabel="student"
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
      </div>

      <TeacherStudentCreateModal
        open={createModalOpen}
        classId={classId}
        className={classContext?.name}
        onClose={() => {
          setCreateModalOpen(false);
        }}
        onSuccess={async () => {
          toast.success("Student created successfully.");
          setIsLoading(true);
          await loadStudents(currentPage, debouncedSearch);
        }}
      />

      <TeacherStudentDetailModal
        open={detailModalOpen}
        student={selectedStudent}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedStudent(null);
        }}
      />

      <TeacherStudentEditModal
        open={editModalOpen}
        student={selectedStudent}
        className={classContext?.name}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedStudent(null);
        }}
        onSuccess={async () => {
          toast.success("Student updated successfully.");
          setIsLoading(true);
          await loadStudents(currentPage, debouncedSearch);
        }}
      />

      <TeacherStudentDeleteModal
        open={deleteModalOpen}
        student={selectedStudent}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedStudent(null);
        }}
        onSuccess={async () => {
          toast.success("Student deleted successfully.");
          setIsLoading(true);
          await loadStudents(currentPage, debouncedSearch);
        }}
      />
    </DashboardPage>
  );
}
