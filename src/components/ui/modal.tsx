"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  eyebrow = "Action",
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[var(--overlay)] p-3 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={cn(
          "km-panel my-auto max-h-[calc(100vh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-[2rem] p-5 shadow-[var(--shadow-soft)] sm:max-h-[calc(100vh-2rem)] sm:p-6",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="km-eyebrow mb-3 text-xs font-semibold">{eyebrow}</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--on-surface)]">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--hover-overlay)]"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
