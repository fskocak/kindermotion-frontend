import { Activity, Footprints, Star } from "lucide-react";
import type { TeacherStudentMilestone } from "@/types/teacher";

const iconMap = {
  Footprints,
  Activity,
  Star,
};

function MilestoneItem({
  title,
  description,
  iconName,
  variant = "primary",
}: {
  title: string;
  description: string;
  iconName: string;
  variant?: string;
}) {
  const bgClass =
    variant === "secondary"
      ? "bg-[var(--secondary-soft)] text-[var(--secondary)]"
      : "bg-[var(--primary-soft)] text-[var(--primary)]";

  const Icon = iconMap[iconName as keyof typeof iconMap] ?? Star;

  return (
    <div className="km-panel flex items-center gap-4 rounded-[1.75rem] p-4 transition-shadow hover:shadow-[var(--shadow-soft)]">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-full ${bgClass}`}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-[var(--on-surface)]">
          {title}
        </span>
        <span className="text-[12px] text-[var(--on-surface-variant)] leading-tight">
          {description}
        </span>
      </div>
    </div>
  );
}

export function MilestonesList({
  milestones,
}: {
  milestones: TeacherStudentMilestone[];
}) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="flex flex-col">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--outline-variant)]">
          LATEST MILESTONES
        </h3>
        <div className="text-sm text-[var(--on-surface-variant)]">
          No milestones reached yet.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--outline-variant)]">
        LATEST MILESTONES
      </h3>
      <div className="grid gap-4">
        {milestones.map((ms) => (
          <MilestoneItem
            key={ms.id}
            title={ms.title}
            description={ms.description}
            iconName={ms.iconName}
            variant={ms.variant}
          />
        ))}
      </div>
    </div>
  );
}
