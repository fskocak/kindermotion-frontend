"use client";

import type { ReactNode } from "react";

import { FormActions } from "@/components/ui/form-actions";
import { Modal } from "@/components/ui/modal";
import { MutationFeedback } from "@/components/ui/mutation-feedback";

type ConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmLoadingLabel?: string;
  cancelLabel?: string;
  eyebrow?: string;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  feedback?: string | null;
  children?: ReactNode;
};

export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  confirmLoadingLabel,
  cancelLabel,
  eyebrow = "Action",
  isLoading = false,
  isConfirmDisabled = false,
  feedback,
  children,
}: ConfirmationModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      eyebrow={eyebrow}
    >
      <div className="grid gap-5">
        {children ? (
          <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-4 text-sm leading-6 text-[var(--on-surface-variant)]">
            {children}
          </div>
        ) : null}

        {feedback ? <MutationFeedback message={feedback} /> : null}

        <FormActions
          onCancel={onClose}
          cancelLabel={cancelLabel}
          submitType="button"
          onSubmitClick={onConfirm}
          submitLabel={confirmLabel}
          submittingLabel={confirmLoadingLabel}
          isSubmitting={isLoading}
          isSubmitDisabled={isConfirmDisabled}
          submitVariant="outline"
        />
      </div>
    </Modal>
  );
}
