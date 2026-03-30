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
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type { TeacherStudent } from "@/types/teacher";

type TeacherStudentEditModalProps = {
  open: boolean;
  student: TeacherStudent | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

function buildDefaultValues(
  student: TeacherStudent | null,
): TeacherStudentFormValues {
  return {
    fullName: student?.fullName ?? "",
    allergies: student?.allergies ?? "",
    conditions: student?.conditions ?? "",
    medications: student?.medications ?? "",
    medicalNotes: student?.medicalNotes ?? "",
  };
}

export function TeacherStudentEditModal({
  open,
  student,
  onClose,
  onSuccess,
}: TeacherStudentEditModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const form = useForm<TeacherStudentFormValues>({
    resolver: zodResolver(teacherStudentFormSchema),
    defaultValues: buildDefaultValues(student),
  });

  useEffect(() => {
    form.reset(buildDefaultValues(student));
  }, [form, student, open]);

  async function onSubmit(values: TeacherStudentFormValues) {
    if (!student) {
      return;
    }

    setFeedback(null);

    try {
      await teacherService.updateStudent(student.id, values);
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
      onClose={onClose}
      eyebrow="Teacher Action"
      title="Edit student"
      description="Update the core classroom care fields for this student using the teacher-scoped student update flow."
      className="max-w-3xl"
    >
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <TeacherStudentFormFields
          idPrefix="edit-student"
          register={form.register}
          errors={form.formState.errors}
        />

        {feedback ? <MutationFeedback message={feedback} /> : null}

        <FormActions
          onCancel={onClose}
          submitLabel="Save changes"
          submittingLabel="Saving..."
          isSubmitting={form.formState.isSubmitting}
          isSubmitDisabled={!student}
        />
      </form>
    </Modal>
  );
}
