import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TeacherStudentFormValues } from "@/features/teacher/schemas/student-form-schema";

type TeacherStudentFormFieldsProps = {
  idPrefix: string;
  className?: string;
  register: UseFormRegister<TeacherStudentFormValues>;
  errors: FieldErrors<TeacherStudentFormValues>;
};

export function TeacherStudentFormFields({
  idPrefix,
  className,
  register,
  errors,
}: TeacherStudentFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-student-id`}>Student ID</Label>
          <Input
            id={`${idPrefix}-student-id`}
            inputMode="numeric"
            placeholder="Optional numeric ID"
            {...register("studentId")}
          />
          {errors.studentId ? (
            <p className="text-sm text-[var(--error)]">
              {errors.studentId.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-status`}>Status</Label>
          <Select id={`${idPrefix}-status`} {...register("isActive")}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
          {errors.isActive ? (
            <p className="text-sm text-[var(--error)]">
              {errors.isActive.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-age`}>Age</Label>
          <Input
            id={`${idPrefix}-age`}
            inputMode="numeric"
            placeholder="Optional age"
            {...register("age")}
          />
          {errors.age ? (
            <p className="text-sm text-[var(--error)]">
              {errors.age.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-gender`}>Gender</Label>
          <Select id={`${idPrefix}-gender`} {...register("gender")}>
            <option value="UNSPECIFIED">Unspecified</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
          {errors.gender ? (
            <p className="text-sm text-[var(--error)]">
              {errors.gender.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-name`}>Name</Label>
          <Input
            id={`${idPrefix}-name`}
            placeholder="Student first name"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-sm text-[var(--error)]">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-surname`}>Surname</Label>
          <Input
            id={`${idPrefix}-surname`}
            placeholder="Student surname"
            {...register("surname")}
          />
          {errors.surname ? (
            <p className="text-sm text-[var(--error)]">
              {errors.surname.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-date-of-birth`}>Date of birth</Label>
          <Input
            id={`${idPrefix}-date-of-birth`}
            type="date"
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth ? (
            <p className="text-sm text-[var(--error)]">
              {errors.dateOfBirth.message}
            </p>
          ) : null}
        </div>

        {className ? (
          <div className="grid gap-2">
            <Label htmlFor={`${idPrefix}-class-name`}>Class</Label>
            <Input
              id={`${idPrefix}-class-name`}
              value={className}
              readOnly
              disabled
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-guardian-name`}>Guardian name</Label>
          <Input
            id={`${idPrefix}-guardian-name`}
            placeholder="Parent or guardian name"
            {...register("guardianName")}
          />
          {errors.guardianName ? (
            <p className="text-sm text-[var(--error)]">
              {errors.guardianName.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-guardian-phone`}>
            Guardian contact phone
          </Label>
          <Input
            id={`${idPrefix}-guardian-phone`}
            type="tel"
            placeholder="Phone number"
            {...register("guardianContactPhone")}
          />
          {errors.guardianContactPhone ? (
            <p className="text-sm text-[var(--error)]">
              {errors.guardianContactPhone.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-health-info`}>Health information</Label>
        <Textarea
          id={`${idPrefix}-health-info`}
          className="min-h-24"
          placeholder="General health notes, risks, or relevant care information"
          {...register("healthInfo")}
        />
        {errors.healthInfo ? (
          <p className="text-sm text-[var(--error)]">
            {errors.healthInfo.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-allergies`}>Allergies</Label>
          <Textarea
            id={`${idPrefix}-allergies`}
            className="min-h-24"
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
            className="min-h-24"
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
            className="min-h-24"
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
            className="min-h-24"
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
