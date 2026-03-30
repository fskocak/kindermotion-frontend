import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/date-time";
import type { AdminClass } from "@/types/admin";

type AdminClassCardProps = {
  classItem: AdminClass;
  onEdit: (classItem: AdminClass) => void;
  onDelete: (classItem: AdminClass) => void;
};

export function AdminClassCard({
  classItem,
  onEdit,
  onDelete,
}: AdminClassCardProps) {
  return (
    <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
            {classItem.name}
          </p>
          <p className="text-sm text-[var(--on-surface-variant)]">
            {classItem.teacher
              ? `${classItem.teacher.fullName} · ${classItem.teacher.email}`
              : classItem.teacherId}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
            {formatDateTime(classItem.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onEdit(classItem)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(classItem)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
