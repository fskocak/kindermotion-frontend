"use client";

import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDateTime } from "@/lib/format/date-time";
import type { TeacherStudent } from "@/types/teacher";
import { TeacherStudentDetailField } from "@/features/teacher/components/teacher-student-detail-field";

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
  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Teacher Detail"
      title={student?.fullName ?? "Student details"}
      description="Review the stored health and care information for this student. Empty medical fields are shown with a clear fallback."
      className="max-w-3xl"
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary">Student Record</Badge>
          {student ? <Badge>ID {student.id.slice(0, 8)}</Badge> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TeacherStudentDetailField
            label="Full name"
            value={student?.fullName}
            emptyLabel="No student name available"
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
