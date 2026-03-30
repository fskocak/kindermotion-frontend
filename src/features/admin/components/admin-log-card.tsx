import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format/date-time";
import type { AdminLog } from "@/types/admin";

type AdminLogCardProps = {
  log: AdminLog;
};

function formatLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function renderDetails(details: AdminLog["details"]) {
  if (!details) {
    return (
      <p className="text-sm leading-6 text-[var(--on-surface-variant)]">
        No details were recorded for this event.
      </p>
    );
  }

  if (typeof details === "string") {
    return (
      <p className="text-sm leading-6 text-[var(--on-surface-variant)]">
        {details}
      </p>
    );
  }

  const entries = Object.entries(details);

  if (entries.length === 0) {
    return (
      <p className="text-sm leading-6 text-[var(--on-surface-variant)]">
        No details were recorded for this event.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-[1.3rem] bg-[var(--surface-container-lowest)] px-4 py-3"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
            {formatLabel(key)}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--on-surface)]">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdminLogCard({ log }: AdminLogCardProps) {
  return (
    <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="primary">{log.action}</Badge>
              {log.entity ? <Badge>{log.entity}</Badge> : null}
              {log.entityId ? <Badge>ID {log.entityId.slice(0, 8)}</Badge> : null}
            </div>

            <p className="text-sm leading-6 text-[var(--on-surface-variant)]">
              {log.admin
                ? `${log.admin.fullName} · ${log.admin.email}`
                : "Unknown admin"}
            </p>
          </div>

          <div className="shrink-0 rounded-full bg-[var(--surface-container-lowest)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
            {formatDateTime(log.createdAt)}
          </div>
        </div>

        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
            Details
          </p>
          {renderDetails(log.details)}
        </div>
      </div>
    </div>
  );
}
