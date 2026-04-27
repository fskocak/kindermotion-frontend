import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/date-time";
import type { AdminTeacher } from "@/types/admin";

type AdminTeacherCardProps = {
  teacher: AdminTeacher;
  onEdit: (teacher: AdminTeacher) => void;
  onDelete: (teacher: AdminTeacher) => void;
};

export function AdminTeacherCard({
  teacher,
  onEdit,
  onDelete,
}: AdminTeacherCardProps) {
  return (
    <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
            {teacher.fullName}
          </p>
          <p className="text-sm text-[var(--on-surface-variant)]">
            {teacher.email}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
            {formatDateTime(teacher.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onEdit(teacher)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(teacher)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
