"use client";

import { useState } from "react";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type { TeacherStudent } from "@/types/teacher";

type TeacherStudentDeleteModalProps = {
  open: boolean;
  student: TeacherStudent | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

export function TeacherStudentDeleteModal({
  open,
  student,
  onClose,
  onSuccess,
}: TeacherStudentDeleteModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onDelete() {
    if (!student) {
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      await teacherService.deleteStudent(student.id);
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
      eyebrow="Teacher Action"
      title="Delete student"
      description="This action removes the student record from the selected class. If the backend blocks deletion because of linked data or ownership rules, the API error will be shown as-is."
      confirmLabel="Delete student"
      confirmLoadingLabel="Deleting..."
      isLoading={isSubmitting}
      isConfirmDisabled={!student}
      feedback={feedback}
    >
      {student ? (
        <>
          You are about to remove <strong>{student.fullName}</strong> from this
          class.
        </>
      ) : (
        "Select a student to delete."
      )}
    </ConfirmationModal>
  );
}
