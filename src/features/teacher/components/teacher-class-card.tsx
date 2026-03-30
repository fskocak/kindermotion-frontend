import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/date-time";
import { getTeacherClassRoute } from "@/lib/constants/routes";
import type { TeacherClass } from "@/types/teacher";

type TeacherClassCardProps = {
  classItem: TeacherClass;
};

export function TeacherClassCard({ classItem }: TeacherClassCardProps) {
  return (
    <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="primary">Class</Badge>
          </div>
          <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
            {classItem.name}
          </p>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
            Created {formatDateTime(classItem.createdAt)}
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href={getTeacherClassRoute(classItem.id)}>View students</Link>
        </Button>
      </div>
    </div>
  );
}
