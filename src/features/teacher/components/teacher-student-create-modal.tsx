"use client";

import { useState } from "react";
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

type TeacherStudentCreateModalProps = {
  open: boolean;
  classId: string;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

const EMPTY_FORM_VALUES: TeacherStudentFormValues = {
  fullName: "",
  allergies: "",
  conditions: "",
  medications: "",
  medicalNotes: "",
};

export function TeacherStudentCreateModal({
  open,
  classId,
  onClose,
  onSuccess,
}: TeacherStudentCreateModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const form = useForm<TeacherStudentFormValues>({
    resolver: zodResolver(teacherStudentFormSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });

  async function onSubmit(values: TeacherStudentFormValues) {
    setFeedback(null);

    try {
      await teacherService.createStudent({
        classId,
        ...values,
      });
      await onSuccess();
      form.reset(EMPTY_FORM_VALUES);
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
      title="Add student"
      description="Create a new student for this class using the teacher-scoped student flow."
      className="max-w-3xl"
    >
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <TeacherStudentFormFields
          idPrefix="create-student"
          register={form.register}
          errors={form.formState.errors}
        />

        {feedback ? <MutationFeedback message={feedback} /> : null}

        <FormActions
          onCancel={onClose}
          submitLabel="Create student"
          submittingLabel="Creating..."
          isSubmitting={form.formState.isSubmitting}
        />
      </form>
    </Modal>
  );
}
