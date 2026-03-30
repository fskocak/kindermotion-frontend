"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormActions } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { Select } from "@/components/ui/select";
import {
  updateClassSchema,
  type UpdateClassFormValues,
} from "@/features/admin/schemas/update-class-schema";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { adminService } from "@/services";
import type { AdminClass, AdminTeacher } from "@/types/admin";

type AdminClassEditModalProps = {
  open: boolean;
  classItem: AdminClass | null;
  teachers: AdminTeacher[];
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

export function AdminClassEditModal({
  open,
  classItem,
  teachers,
  onClose,
  onSuccess,
}: AdminClassEditModalProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const form = useForm<UpdateClassFormValues>({
    resolver: zodResolver(updateClassSchema),
    defaultValues: {
      name: classItem?.name ?? "",
      teacherId: classItem?.teacherId ?? "",
    },
  });

  useEffect(() => {
    if (!classItem) {
      return;
    }

    form.reset({
      name: classItem.name,
      teacherId: classItem.teacherId,
    });
  }, [classItem, form]);

  async function onSubmit(values: UpdateClassFormValues) {
    if (!classItem) {
      return;
    }

    setFeedback(null);

    try {
      await adminService.updateClass(classItem.id, values);
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
      title="Edit class"
      description="Update the class name and teacher assignment using the same DTO-shaped flow as class creation."
    >
      <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="edit-class-name">Class name</Label>
          <Input id="edit-class-name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-sm text-[var(--error)]">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="edit-class-teacher">Assigned teacher</Label>
          <Select id="edit-class-teacher" {...form.register("teacherId")}>
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.fullName} ({teacher.email})
              </option>
            ))}
          </Select>
          {form.formState.errors.teacherId ? (
            <p className="text-sm text-[var(--error)]">
              {form.formState.errors.teacherId.message}
            </p>
          ) : null}
        </div>

        {feedback ? <MutationFeedback message={feedback} /> : null}

        <FormActions
          onCancel={onClose}
          submitLabel="Save changes"
          submittingLabel="Saving..."
          isSubmitting={form.formState.isSubmitting}
          isSubmitDisabled={teachers.length === 0}
        />
      </form>
    </Modal>
  );
}
