"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormActions } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import {
  updateTeacherSchema,
  type UpdateTeacherFormValues,
} from "@/features/admin/schemas/update-teacher-schema";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { adminService } from "@/services";
import type { AdminTeacher } from "@/types/admin";

type AdminTeacherEditModalProps = {
  open: boolean;
  teacher: AdminTeacher | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

export function AdminTeacherEditModal({
  open,
  teacher,
  onClose,
  onSuccess,
}: AdminTeacherEditModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const form = useForm<UpdateTeacherFormValues>({
    resolver: zodResolver(updateTeacherSchema),
    defaultValues: {
      fullName: teacher?.fullName ?? "",
      email: teacher?.email ?? "",
    },
  });

  useEffect(() => {
    if (!teacher) {
      return;
    }

    form.reset({
      fullName: teacher.fullName,
      email: teacher.email,
    });
  }, [form, teacher]);

  async function onSubmit(values: UpdateTeacherFormValues) {
    if (!teacher) {
      return;
    }

    setFeedback(null);

    try {
      await adminService.updateTeacher(teacher.id, values);
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
      title="Edit teacher"
      description="Update the visible account fields for this teacher."
    >
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="edit-teacher-full-name">Full name</Label>
          <Input id="edit-teacher-full-name" {...form.register("fullName")} />
          {form.formState.errors.fullName ? (
            <p className="text-sm text-[var(--error)]">
              {form.formState.errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="edit-teacher-email">Email</Label>
          <Input
            id="edit-teacher-email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-[var(--error)]">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        {feedback ? <MutationFeedback message={feedback} /> : null}

        <FormActions
          onCancel={onClose}
          submitLabel="Save changes"
          submittingLabel="Saving..."
          isSubmitting={form.formState.isSubmitting}
        />
      </form>
    </Modal>
  );
}
