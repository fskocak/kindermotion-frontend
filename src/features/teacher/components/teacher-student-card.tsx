import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const healthNotes = buildHealthNotes(student);

  return (
    <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-2">
            <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
              {student.fullName}
            </p>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Updated {formatDateTime(student.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>ID {student.id.slice(0, 8)}</Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(student)}
            >
              View details
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
