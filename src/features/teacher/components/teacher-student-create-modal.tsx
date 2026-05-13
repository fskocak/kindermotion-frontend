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
import { buildTeacherStudentMutationPayload } from "@/features/teacher/student-utils";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";

type TeacherStudentCreateModalProps = {
  open: boolean;
  classId: string;
  className?: string;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

const EMPTY_FORM_VALUES: TeacherStudentFormValues = {
  studentId: "",
  name: "",
  surname: "",
  dateOfBirth: "",
  age: "",
  gender: "UNSPECIFIED",
  healthInfo: "",
  guardianName: "",
  guardianContactPhone: "",
  isActive: "ACTIVE",
  allergies: "",
  conditions: "",
  medications: "",
  medicalNotes: "",
};

export function TeacherStudentCreateModal({
  open,
  classId,
  className,
  onClose,
  onSuccess,
}: TeacherStudentCreateModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const form = useForm<TeacherStudentFormValues>({
    resolver: zodResolver(teacherStudentFormSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });

  useEffect(() => {
    if (!open) {
      form.reset(EMPTY_FORM_VALUES);
    }
  }, [form, open]);

  function handleClose() {
    setFeedback(null);
    form.reset(EMPTY_FORM_VALUES);
    onClose();
  }

  async function onSubmit(values: TeacherStudentFormValues) {
    setFeedback(null);

    try {
      await teacherService.createStudent({
        classId,
        ...buildTeacherStudentMutationPayload(values),
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
      onClose={handleClose}
      eyebrow="Teacher Action"
      title="Add student"
      description="Create a new student record for this class with the updated identity, guardian, status, and health fields."
      className="max-w-3xl"
    >
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <TeacherStudentFormFields
          idPrefix="create-student"
          className={className}
          register={form.register}
          setValue={form.setValue}
          watch={form.watch}
          errors={form.formState.errors}
        />

        {feedback ? <MutationFeedback message={feedback} /> : null}

        <FormActions
          onCancel={handleClose}
          submitLabel="Create student"
          submittingLabel="Creating..."
          isSubmitting={form.formState.isSubmitting}
        />
      </form>
    </Modal>
  );
}
