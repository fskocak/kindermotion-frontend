import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/date-time";
import type { AdminMonitoringConfig } from "@/types/admin";

type AdminMonitoringConfigCardProps = {
  monitoringConfig: AdminMonitoringConfig;
  classNameLabel: string;
  teacherLabel: string;
  onEdit: (monitoringConfig: AdminMonitoringConfig) => void;
};

type FlagChipProps = {
  label: string;
  enabled: boolean;
};

function FlagChip({ label, enabled }: FlagChipProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        enabled
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
      }`}
    >
      {label}: {enabled ? "ON" : "OFF"}
    </span>
  );
}

export function AdminMonitoringConfigCard({
  monitoringConfig,
  classNameLabel,
  teacherLabel,
  onEdit,
}: AdminMonitoringConfigCardProps) {
  return (
    <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
              {classNameLabel}
            </p>
            <p className="text-sm text-[var(--on-surface-variant)]">
              {teacherLabel}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
              Updated {formatDateTime(monitoringConfig.updatedAt)}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onEdit(monitoringConfig)}
          >
            Edit
          </Button>
        </div>

        <div className="rounded-[1.5rem] bg-[var(--surface-container-lowest)] p-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <FlagChip label="System" enabled={monitoringConfig.isEnabled} />
            <FlagChip
              label="Distance"
              enabled={monitoringConfig.distanceAlertsEnabled}
            />
            <FlagChip
              label="Motion"
              enabled={monitoringConfig.motionSummaryEnabled}
            />
            <FlagChip
              label="Recording"
              enabled={monitoringConfig.recordingEnabled}
            />
          </div>

          <p className="text-sm leading-6 text-[var(--on-surface-variant)]">
            Proximity threshold:{" "}
            <span className="font-semibold text-[var(--on-surface)]">
              {monitoringConfig.proximityThresholdCm} cm
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
