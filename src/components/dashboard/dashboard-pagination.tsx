import { Button } from "@/components/ui/button";

type DashboardPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  itemLabel: string;
  onPrevious: () => void;
  onNext: () => void;
};

function formatItemLabel(total: number, itemLabel: string) {
  if (total === 1) {
    return `1 ${itemLabel}`;
  }

  return `${total} ${itemLabel}s`;
}

export function DashboardPagination({
  page,
  totalPages,
  total,
  itemLabel,
  onPrevious,
  onNext,
}: DashboardPaginationProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.75rem] bg-[var(--surface-container-low)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--on-surface-variant)]">
        Page {page} of {totalPages} · {formatItemLabel(total, itemLabel)}
      </p>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
