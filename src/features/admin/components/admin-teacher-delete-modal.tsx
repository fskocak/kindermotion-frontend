"use client";

import { useState } from "react";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { adminService } from "@/services";
import type { AdminTeacher } from "@/types/admin";

type AdminTeacherDeleteModalProps = {
  open: boolean;
  teacher: AdminTeacher | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

export function AdminTeacherDeleteModal({
  open,
  teacher,
  onClose,
  onSuccess,
}: AdminTeacherDeleteModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onDelete() {
    if (!teacher) {
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      await adminService.deleteTeacher(teacher.id);
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
      title="Delete teacher"
      description="This action is permanent. If the backend prevents deletion because the teacher is linked to classes, the API error will be shown as-is."
      confirmLabel="Delete teacher"
      confirmLoadingLabel="Deleting..."
      isLoading={isSubmitting}
      isConfirmDisabled={!teacher}
      feedback={feedback}
    >
      {teacher ? (
        <>
          You are about to remove <strong>{teacher.fullName}</strong> (
          {teacher.email}).
        </>
      ) : (
        "Select a teacher to delete."
      )}
    </ConfirmationModal>
  );
}
