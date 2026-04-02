"use client";

function ProgressRow({ label, percentage }: { label: string; percentage: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-[13px] font-bold tracking-[0.02em] text-[var(--on-surface)]">
        {label}
        <span className="text-[var(--primary)]">{percentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--surface-container-low)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

type SkillProgressCardProps = {
  dexterity: number;
  balance: number;
  coordination: number;
};

export function SkillProgressCard({
  dexterity,
  balance,
  coordination,
}: SkillProgressCardProps) {
  return (
    <div className="km-panel flex h-[360px] flex-col rounded-[2rem] p-8">
      <h2 className="mb-8 text-xl font-bold tracking-[-0.02em] text-[var(--on-surface)]">
        Skill Progress
      </h2>

      <div className="grid flex-1 gap-6">
        <ProgressRow label="Dexterity" percentage={dexterity} />
        <ProgressRow label="Balance" percentage={balance} />
        <ProgressRow label="Coordination" percentage={coordination} />
      </div>
    </div>
  );
}
