"use client";

import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  formatTeacherStudentDate,
  getTeacherStudentAge,
  getTeacherStudentDisplayName,
  getTeacherStudentGenderLabel,
  getTeacherStudentStatusLabel,
} from "@/features/teacher/student-utils";
import { TeacherStudentDetailField } from "@/features/teacher/components/teacher-student-detail-field";
import { formatDateTime } from "@/lib/format/date-time";
import type { TeacherStudent } from "@/types/teacher";

type TeacherStudentDetailModalProps = {
  open: boolean;
  student: TeacherStudent | null;
  onClose: () => void;
};

export function TeacherStudentDetailModal({
  open,
  student,
  onClose,
}: TeacherStudentDetailModalProps) {
  const studentName = student ? getTeacherStudentDisplayName(student) : null;
  const studentAge = student ? getTeacherStudentAge(student) : null;
  const studentGender = getTeacherStudentGenderLabel(student?.gender);
  const studentBirthDate = formatTeacherStudentDate(student?.dateOfBirth);
  const studentStatus = getTeacherStudentStatusLabel(student?.isActive);

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Teacher Detail"
      title={studentName ?? "Student details"}
      description="Review the stored student identity, guardian, status, and health information. Empty fields are shown with a clear fallback."
      className="max-w-3xl"
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary">Student Record</Badge>
          <Badge variant={student?.isActive === false ? "muted" : "primary"}>
            {studentStatus}
          </Badge>
          {student?.studentId ? <Badge>Student #{student.studentId}</Badge> : null}
          {student?.className ? <Badge>{student.className}</Badge> : null}
          {student ? <Badge>ID {student.id.slice(0, 8)}</Badge> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TeacherStudentDetailField
            label="Name"
            value={student?.name}
            emptyLabel="No name available"
          />
          <TeacherStudentDetailField
            label="Surname"
            value={student?.surname}
            emptyLabel="No surname available"
          />
          <TeacherStudentDetailField
            label="Display name"
            value={studentName}
            emptyLabel="No student name available"
          />
          <TeacherStudentDetailField
            label="Date of birth"
            value={studentBirthDate}
            emptyLabel="No birth date recorded"
          />
          <TeacherStudentDetailField
            label="Age"
            value={studentAge !== null ? String(studentAge) : null}
            emptyLabel="No age recorded"
          />
          <TeacherStudentDetailField
            label="Gender"
            value={studentGender}
            emptyLabel="No gender recorded"
          />
          <TeacherStudentDetailField
            label="Guardian name"
            value={student?.guardianName}
            emptyLabel="No guardian name recorded"
          />
          <TeacherStudentDetailField
            label="Guardian contact phone"
            value={student?.guardianContactPhone}
            emptyLabel="No guardian contact phone recorded"
          />
          <TeacherStudentDetailField
            label="Class"
            value={student?.className}
            emptyLabel="No class name recorded"
          />
          <TeacherStudentDetailField
            label="Allergies"
            value={student?.allergies}
            emptyLabel="No allergies recorded"
          />
          <TeacherStudentDetailField
            label="Conditions"
            value={student?.conditions}
            emptyLabel="No conditions recorded"
          />
          <TeacherStudentDetailField
            label="Medications"
            value={student?.medications}
            emptyLabel="No medications recorded"
          />
        </div>

        <TeacherStudentDetailField
          label="Health information"
          value={student?.healthInfo}
          emptyLabel="No health information recorded"
        />

        <TeacherStudentDetailField
          label="Medical notes"
          value={student?.medicalNotes}
          emptyLabel="No medical notes recorded"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TeacherStudentDetailField
            label="Created at"
            value={student ? formatDateTime(student.createdAt) : null}
          />
          <TeacherStudentDetailField
            label="Last updated"
            value={student ? formatDateTime(student.updatedAt) : null}
          />
        </div>
      </div>
    </Modal>
  );
}
