import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatTeacherStudentDate,
  getTeacherStudentAge,
  getTeacherStudentDisplayName,
  getTeacherStudentGenderLabel,
  getTeacherStudentStatusLabel,
} from "@/features/teacher/student-utils";
import { formatDateTime } from "@/lib/format/date-time";
import type { TeacherStudent } from "@/types/teacher";

type TeacherStudentCardProps = {
  student: TeacherStudent;
  onViewDetails: (student: TeacherStudent) => void;
  onEdit: (student: TeacherStudent) => void;
  onDelete: (student: TeacherStudent) => void;
};

function buildHealthNotes(student: TeacherStudent) {
  const items = [
    student.healthInfo ? `Health info: ${student.healthInfo}` : null,
    student.allergies ? `Allergies: ${student.allergies}` : null,
    student.conditions ? `Conditions: ${student.conditions}` : null,
    student.medications ? `Medications: ${student.medications}` : null,
    student.medicalNotes ? `Notes: ${student.medicalNotes}` : null,
  ].filter(Boolean);

  return items;
}

export function TeacherStudentCard({
  student,
  onViewDetails,
  onEdit,
  onDelete,
}: TeacherStudentCardProps) {
  const studentName = getTeacherStudentDisplayName(student);
  const studentAge = getTeacherStudentAge(student);
  const studentGender = getTeacherStudentGenderLabel(student.gender);
  const birthDate = formatTeacherStudentDate(student.dateOfBirth);
  const studentStatus = getTeacherStudentStatusLabel(student.isActive);
  const healthNotes = buildHealthNotes(student);
  const summaryItems = [
    studentAge !== null ? `Age ${studentAge}` : null,
    studentGender ? studentGender : null,
    birthDate ? `Born ${birthDate}` : null,
    student.guardianName ? `Guardian: ${student.guardianName}` : null,
  ].filter(Boolean);

  return (
    <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-2">
            <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
              {studentName}
            </p>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Updated {formatDateTime(student.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {student.studentId ? <Badge>Student #{student.studentId}</Badge> : null}
            <Badge variant={student.isActive === false ? "muted" : "primary"}>
              {studentStatus}
            </Badge>
            {student.className ? <Badge>{student.className}</Badge> : null}
            <Badge>ID {student.id.slice(0, 8)}</Badge>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/teacher/child-profiles/${student.id}`}>
                View profile
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(student)}
            >
              Student Details
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(student)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDelete(student)}
            >
              Delete
            </Button>
          </div>
        </div>

        {summaryItems.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-sm text-[var(--on-surface-variant)]">
            {summaryItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}

        {healthNotes.length > 0 ? (
          <div className="grid gap-2 text-sm leading-6 text-[var(--on-surface-variant)]">
            {healthNotes.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--on-surface-variant)]">
            No health or care notes are currently recorded for this student.
          </p>
        )}
      </div>
    </div>
  );
}
