"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastRecord = ToastInput & {
  id: number;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} satisfies Record<ToastVariant, typeof CheckCircle2>;

const toastStyles = {
  success:
    "border-[var(--panel-border)] bg-[var(--success-surface)] text-[var(--on-surface)]",
  error:
    "border-[var(--panel-border)] bg-[var(--error-container)] text-[var(--on-error-container)]",
  info: "border-[var(--panel-border)] bg-[var(--info-surface)] text-[var(--on-surface)]",
} satisfies Record<ToastVariant, string>;

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextIdRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ variant = "info", ...input }: ToastInput) => {
      const id = nextIdRef.current++;

      setToasts((current) => [...current, { id, variant, ...input }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, 4000);
    },
    [dismissToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: pushToast,
      success: (title, description) =>
        pushToast({ title, description, variant: "success" }),
      error: (title, description) =>
        pushToast({ title, description, variant: "error" }),
      info: (title, description) =>
        pushToast({ title, description, variant: "info" }),
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4 sm:justify-end">
        <div className="grid w-full max-w-sm gap-3">
          {toasts.map((toast) => {
            const Icon = toastIcons[toast.variant];

            return (
              <div
                key={toast.id}
                className={cn(
                  "pointer-events-auto rounded-[1.6rem] border px-4 py-4 shadow-[var(--shadow-cloud)] backdrop-blur-sm",
                  toastStyles[toast.variant],
                )}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-[var(--icon-chip-background)] p-1.5">
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{toast.title}</p>
                    {toast.description ? (
                      <p className="mt-1 text-sm leading-6 opacity-90">
                        {toast.description}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
                    onClick={() => dismissToast(toast.id)}
                    aria-label="Dismiss notification"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
