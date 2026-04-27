"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormActions } from "@/components/ui/form-actions";
import { Modal } from "@/components/ui/modal";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { TeacherStudentFormFields } from "@/features/teacher/components/teacher-student-form-fields";
import {
  teacherStudentFormSchema,
  type TeacherStudentFormValues,
} from "@/features/teacher/schemas/student-form-schema";
import {
  buildTeacherStudentFormValues,
  buildTeacherStudentMutationPayload,
} from "@/features/teacher/student-utils";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type { TeacherStudent } from "@/types/teacher";

type TeacherStudentEditModalProps = {
  open: boolean;
  student: TeacherStudent | null;
  className?: string;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

export function TeacherStudentEditModal({
  open,
  student,
  className,
  onClose,
  onSuccess,
}: TeacherStudentEditModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const form = useForm<TeacherStudentFormValues>({
    resolver: zodResolver(teacherStudentFormSchema),
    defaultValues: buildTeacherStudentFormValues(student),
  });

  useEffect(() => {
    form.reset(buildTeacherStudentFormValues(student));
  }, [form, student, open]);

  function handleClose() {
    setFeedback(null);
    form.reset(buildTeacherStudentFormValues(student));
    onClose();
  }

  async function onSubmit(values: TeacherStudentFormValues) {
    if (!student) {
      return;
    }

    setFeedback(null);

    try {
      await teacherService.updateStudent(
        student.id,
        buildTeacherStudentMutationPayload(values),
      );
      await onSuccess();
      form.reset(values);
      onClose();
    } catch (error) {
      setFeedback(getApiErrorMessage(error));
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      eyebrow="Teacher Action"
      title="Edit student"
      description="Update the student identity, guardian, status, and health fields while preserving the current class-scoped flow."
      className="max-w-3xl"
    >
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <TeacherStudentFormFields
          idPrefix="edit-student"
          className={className}
          register={form.register}
          errors={form.formState.errors}
        />

        {feedback ? <MutationFeedback message={feedback} /> : null}

        <FormActions
          onCancel={handleClose}
          submitLabel="Save changes"
          submittingLabel="Saving..."
          isSubmitting={form.formState.isSubmitting}
          isSubmitDisabled={!student}
        />
      </form>
    </Modal>
  );
}
