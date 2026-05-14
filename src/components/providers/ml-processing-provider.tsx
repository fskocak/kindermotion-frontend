"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type MlProcessingStatus = "processing" | "completed" | "failed";

type MlProcessingJob = {
  id: string;
  title: string;
  detail: string;
  status: MlProcessingStatus;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
};

type StartMlProcessingJobPayload = {
  title: string;
  detail: string;
};

type MlProcessingContextValue = {
  activeJob: MlProcessingJob | null;
  startJob: (payload: StartMlProcessingJobPayload) => string;
  updateJob: (id: string, detail: string, progress?: number) => void;
  completeJob: (id: string, detail: string) => void;
  failJob: (id: string, error: string) => void;
  openPanel: () => void;
};

const MlProcessingContext = createContext<MlProcessingContextValue | null>(null);

function createJobId() {
  return `ml-job-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function MlProcessingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeJob, setActiveJob] = useState<MlProcessingJob | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (!activeJob || activeJob.status !== "processing") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveJob((current) => {
        if (!current || current.status !== "processing") {
          return current;
        }

        const nextProgress =
          current.progress < 60
            ? current.progress + 4
            : current.progress < 82
              ? current.progress + 2
              : current.progress + 1;

        return {
          ...current,
          progress: Math.min(nextProgress, 92),
        };
      });
    }, 1300);

    return () => window.clearInterval(intervalId);
  }, [activeJob]);

  const startJob = useCallback((payload: StartMlProcessingJobPayload) => {
    const id = createJobId();

    setActiveJob({
      id,
      title: payload.title,
      detail: payload.detail,
      status: "processing",
      progress: 8,
      startedAt: new Date().toISOString(),
      completedAt: null,
      error: null,
    });
    setIsPanelOpen(false);

    return id;
  }, []);

  const updateJob = useCallback((id: string, detail: string, progress?: number) => {
    setActiveJob((current) => {
      if (!current || current.id !== id) {
        return current;
      }

      return {
        ...current,
        detail,
        progress:
          progress === undefined
            ? current.progress
            : Math.min(Math.max(progress, current.progress), 94),
      };
    });
  }, []);

  const completeJob = useCallback((id: string, detail: string) => {
    setActiveJob((current) => {
      if (!current || current.id !== id) {
        return current;
      }

      return {
        ...current,
        detail,
        status: "completed",
        progress: 100,
        completedAt: new Date().toISOString(),
        error: null,
      };
    });
    setIsPanelOpen(true);
  }, []);

  const failJob = useCallback((id: string, error: string) => {
    setActiveJob((current) => {
      if (!current || current.id !== id) {
        return current;
      }

      return {
        ...current,
        detail: "ML processing could not be completed.",
        status: "failed",
        progress: 100,
        completedAt: new Date().toISOString(),
        error,
      };
    });
    setIsPanelOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      activeJob,
      startJob,
      updateJob,
      completeJob,
      failJob,
      openPanel: () => setIsPanelOpen(true),
    }),
    [activeJob, completeJob, failJob, startJob, updateJob],
  );

  return (
    <MlProcessingContext.Provider value={value}>
      {children}
      <MlProcessingFloatingPanel
        job={activeJob}
        isOpen={isPanelOpen}
        onOpen={() => setIsPanelOpen(true)}
        onClosePanel={() => setIsPanelOpen(false)}
        onDismiss={() => {
          setActiveJob(null);
          setIsPanelOpen(false);
        }}
      />
    </MlProcessingContext.Provider>
  );
}

export function useMlProcessing() {
  const context = useContext(MlProcessingContext);

  if (!context) {
    throw new Error("useMlProcessing must be used inside MlProcessingProvider");
  }

  return context;
}

function MlProcessingFloatingPanel({
  job,
  isOpen,
  onOpen,
  onClosePanel,
  onDismiss,
}: {
  job: MlProcessingJob | null;
  isOpen: boolean;
  onOpen: () => void;
  onClosePanel: () => void;
  onDismiss: () => void;
}) {
  if (!job) {
    return null;
  }

  const isProcessing = job.status === "processing";
  const isCompleted = job.status === "completed";
  const statusLabel = isProcessing
    ? "Processing"
    : isCompleted
      ? "Completed"
      : "Failed";
  const StatusIcon = isProcessing
    ? Activity
    : isCompleted
      ? CheckCircle2
      : AlertTriangle;

  return (
    <div className="fixed right-5 top-5 z-[80] w-[min(22rem,calc(100vw-2rem))]">
      <button
        type="button"
        className="w-full rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-soft)] backdrop-blur-xl transition-transform hover:-translate-y-0.5"
        onClick={onOpen}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-container-high)] text-[var(--primary)]">
              <StatusIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--on-surface)]">
                {job.title}
              </p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-[var(--on-surface-variant)]">
                {statusLabel} - {job.progress}%
              </p>
            </div>
          </div>
          <ChevronDown
            className={`size-4 shrink-0 text-[var(--on-surface-variant)] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-container-high)]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              job.status === "failed" ? "bg-red-400" : "bg-[var(--primary)]"
            }`}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </button>

      {isOpen ? (
        <div className="mt-3 rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--on-surface)]">
                {job.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--on-surface-variant)]">
                {job.detail}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-[var(--on-surface-variant)] hover:bg-[var(--hover-overlay)]"
              onClick={(event) => {
                event.stopPropagation();
                onClosePanel();
              }}
              aria-label="Close ML processing details"
            >
              <X className="size-4" />
            </button>
          </div>

          {job.error ? (
            <div className="mt-3 rounded-[1rem] bg-red-500/10 p-3 text-sm text-red-100">
              {job.error}
            </div>
          ) : null}

          {!isProcessing ? (
            <button
              type="button"
              className="mt-4 rounded-full bg-[var(--surface-container-high)] px-4 py-2 text-sm font-semibold text-[var(--on-surface)] hover:bg-[var(--hover-overlay)]"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
