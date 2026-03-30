"use client";

import { useState } from "react";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { adminService } from "@/services";
import type { AdminClass } from "@/types/admin";

type AdminClassDeleteModalProps = {
  open: boolean;
  classItem: AdminClass | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

export function AdminClassDeleteModal({
  open,
  classItem,
  onClose,
  onSuccess,
}: AdminClassDeleteModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onDelete() {
    if (!classItem) {
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      await adminService.deleteClass(classItem.id);
      await onSuccess();
      onClose();
    } catch (error) {
      setFeedback(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={onDelete}
      eyebrow="Admin Action"
      title="Delete class"
      description="This action is permanent. If the backend blocks deletion because the class is linked to students or related data, the API error will be shown as-is."
      confirmLabel="Delete class"
      confirmLoadingLabel="Deleting..."
      isLoading={isSubmitting}
      isConfirmDisabled={!classItem}
      feedback={feedback}
    >
      {classItem ? (
        <>
          You are about to remove <strong>{classItem.name}</strong>.
        </>
      ) : (
        "Select a class to delete."
      )}
    </ConfirmationModal>
  );
}
