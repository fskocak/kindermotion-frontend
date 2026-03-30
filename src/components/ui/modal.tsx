"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
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

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.24)] p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={cn(
          "km-panel w-full max-w-xl rounded-[2rem] p-6 shadow-[0_24px_64px_rgba(15,23,42,0.16)] sm:p-8",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
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
            className="rounded-full p-2 text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--surface-container-low)]"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
