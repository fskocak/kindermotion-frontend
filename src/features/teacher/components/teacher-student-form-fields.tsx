import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TeacherStudentFormValues } from "@/features/teacher/schemas/student-form-schema";

type TeacherStudentFormFieldsProps = {
  idPrefix: string;
  register: UseFormRegister<TeacherStudentFormValues>;
  errors: FieldErrors<TeacherStudentFormValues>;
};

export function TeacherStudentFormFields({
  idPrefix,
  register,
  errors,
}: TeacherStudentFormFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-full-name`}>Full name</Label>
        <Input id={`${idPrefix}-full-name`} {...register("fullName")} />
        {errors.fullName ? (
          <p className="text-sm text-[var(--error)]">
            {errors.fullName.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-allergies`}>Allergies</Label>
          <Textarea
            id={`${idPrefix}-allergies`}
            placeholder="List any allergies or leave blank"
            {...register("allergies")}
          />
          {errors.allergies ? (
            <p className="text-sm text-[var(--error)]">
              {errors.allergies.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-conditions`}>Conditions</Label>
          <Textarea
            id={`${idPrefix}-conditions`}
            placeholder="List any conditions or leave blank"
            {...register("conditions")}
          />
          {errors.conditions ? (
            <p className="text-sm text-[var(--error)]">
              {errors.conditions.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-medications`}>Medications</Label>
          <Textarea
            id={`${idPrefix}-medications`}
            placeholder="List medications or leave blank"
            {...register("medications")}
          />
          {errors.medications ? (
            <p className="text-sm text-[var(--error)]">
              {errors.medications.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-medical-notes`}>Medical notes</Label>
          <Textarea
            id={`${idPrefix}-medical-notes`}
            placeholder="Add care notes or leave blank"
            {...register("medicalNotes")}
          />
          {errors.medicalNotes ? (
            <p className="text-sm text-[var(--error)]">
              {errors.medicalNotes.message}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
