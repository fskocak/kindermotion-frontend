"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { AdminLogCard } from "@/features/admin/components/admin-log-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { adminService } from "@/services";
import type { AdminLog } from "@/types/admin";

type LogDateFilter = "all" | "today" | "last7" | "last30";

const DATE_FILTER_OPTIONS: Array<{ label: string; value: LogDateFilter }> = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "last7" },
  { label: "Last 30 days", value: "last30" },
];

function isLogWithinDateRange(createdAt: string, range: LogDateFilter) {
  if (range === "all") {
    return true;
  }

  const createdAtDate = new Date(createdAt);
  const now = new Date();

  if (range === "today") {
    return (
      createdAtDate.getFullYear() === now.getFullYear() &&
      createdAtDate.getMonth() === now.getMonth() &&
      createdAtDate.getDate() === now.getDate()
    );
  }

  const nowTime = now.getTime();
  const createdAtTime = createdAtDate.getTime();
  const diffInDays = (nowTime - createdAtTime) / (1000 * 60 * 60 * 24);

  if (range === "last7") {
    return diffInDays <= 7;
  }

  return diffInDays <= 30;
}

export function AdminLogsPageContent() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<LogDateFilter>("all");

  async function loadLogs() {
    try {
      setListError(null);
      const data = await adminService.listLogs();
      setLogs(data);
    } catch (error) {
      setListError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, []);

  const actionOptions = Array.from(new Set(logs.map((log) => log.action))).sort();
  const entityOptions = Array.from(
    new Set(logs.map((log) => log.entity).filter(Boolean)),
  ).sort() as string[];

  const filteredLogs = logs.filter((log) => {
    const matchesAction =
      actionFilter === "all" ? true : log.action === actionFilter;
    const matchesEntity =
      entityFilter === "all" ? true : log.entity === entityFilter;
    const matchesDate = isLogWithinDateRange(log.createdAt, dateFilter);

    return matchesAction && matchesEntity && matchesDate;
  });

  const activeFilterCount = [
    actionFilter !== "all",
    entityFilter !== "all",
    dateFilter !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setActionFilter("all");
    setEntityFilter("all");
    setDateFilter("all");
  }

  return (
    <DashboardPage
      eyebrow="Admin / Logs"
      title="Review administrative actions in a clean read-only stream."
    >
      <DashboardSectionCard
        eyebrow="Activity Stream"
        title="Logs"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {activeFilterCount > 0 ? (
              <Badge variant="primary">
                {activeFilterCount} active filter
                {activeFilterCount > 1 ? "s" : ""}
              </Badge>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                void loadLogs();
              }}
            >
              Refresh
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <DashboardLoadingState label="Loading logs..." />
        ) : listError ? (
          <DashboardErrorState
            title="Could not load logs"
            description={listError}
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsLoading(true);
                  void loadLogs();
                }}
              >
                Retry
              </Button>
            }
          />
        ) : logs.length === 0 ? (
          <DashboardEmptyState
            title="No logs yet"
            description="Administrative activity will appear here as actions are performed from the protected admin area."
          />
        ) : (
          <div className="grid gap-5">
            <div className="grid gap-4 rounded-[1.75rem] bg-[var(--surface-container-low)] p-5 lg:grid-cols-[1fr_1fr_1fr_auto]">
              <div className="grid gap-2">
                <label
                  htmlFor="logs-action-filter"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--on-surface-variant)]"
                >
                  Action
                </label>
                <Select
                  id="logs-action-filter"
                  value={actionFilter}
                  onChange={(event) => setActionFilter(event.target.value)}
                >
                  <option value="all">All actions</option>
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="logs-entity-filter"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--on-surface-variant)]"
                >
                  Entity
                </label>
                <Select
                  id="logs-entity-filter"
                  value={entityFilter}
                  onChange={(event) => setEntityFilter(event.target.value)}
                >
                  <option value="all">All entities</option>
                  {entityOptions.map((entity) => (
                    <option key={entity} value={entity}>
                      {entity}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="logs-date-filter"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--on-surface-variant)]"
                >
                  Date range
                </label>
                <Select
                  id="logs-date-filter"
                  value={dateFilter}
                  onChange={(event) =>
                    setDateFilter(event.target.value as LogDateFilter)
                  }
                >
                  {DATE_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0}
                >
                  Clear filters
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--on-surface-variant)]">
                Showing {filteredLogs.length} of {logs.length} logs.
              </p>
            </div>

            {filteredLogs.length === 0 ? (
              <DashboardEmptyState
                title="No logs match the current filters"
                description="Try a wider date range or clear one of the selected filters to see more activity."
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4">
                {filteredLogs.map((log) => (
                  <AdminLogCard key={log.id} log={log} />
                ))}
              </div>
            )}
          </div>
        )}
      </DashboardSectionCard>
    </DashboardPage>
  );
}
