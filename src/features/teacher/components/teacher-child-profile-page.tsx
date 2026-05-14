"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";

import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { Select } from "@/components/ui/select";
import {
  getTeacherStudentAge,
  getTeacherStudentDisplayName,
} from "@/features/teacher/student-utils";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type {
  TeacherStudentProfileResponse,
  TeacherStudentReportMetric,
} from "@/types/teacher";

import { MilestonesList } from "./profile/milestones-list";
import { MlActivityTrendChart } from "./profile/ml-activity-trend-chart";
import { MlDailyActivityChart } from "./profile/ml-daily-activity-chart";
import {
  buildStudentReportMetrics,
  getFiveDayWindow,
  getMetricForDate,
  getReportDateOptions,
} from "./profile/ml-report-metrics";
import { ProfileHeader } from "./profile/profile-header";

import { WeeklySummaryChart } from "./profile/weekly-summary-chart";


type TeacherChildProfilePageContentProps = {
  studentId: string;
};

export function TeacherChildProfilePageContent({
  studentId,
}: TeacherChildProfilePageContentProps) {
  const [profileData, setProfileData] =
    useState<TeacherStudentProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [loadingReportJobId, setLoadingReportJobId] = useState<string | null>(
    null,
  );
  const [metrics, setMetrics] = useState<TeacherStudentReportMetric[]>([]);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [selectedMetricDate, setSelectedMetricDate] = useState("");
  const [trendWindowStart, setTrendWindowStart] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      const data = await teacherService.getStudentProfile(studentId);
      setProfileData(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!profileData) {
      return;
    }

    const currentReports = profileData.reports;

    if (currentReports.length === 0) {
      setMetrics([]);
      setMetricsError(null);
      setIsLoadingMetrics(false);
      setSelectedMetricDate("");
      setTrendWindowStart("");
      return;
    }

    let isCancelled = false;

    async function loadReportMetrics() {
      setIsLoadingMetrics(true);
      setMetricsError(null);

      try {
        const result = await buildStudentReportMetrics(
          currentReports,
          async (jobId) => {
            const access = await teacherService.getMlJobAssetAccess(
              jobId,
              "prediction-csv",
            );
            const targetUrl = access.downloadUrl || access.previewUrl;

            if (!targetUrl) {
              throw new Error("Prediction CSV URL is not available yet.");
            }

            const response = await fetch(targetUrl);
            if (!response.ok) {
              throw new Error("Prediction CSV could not be loaded.");
            }

            return response.text();
          },
        );

        if (isCancelled) {
          return;
        }

        setMetrics(result.metrics);

        if (result.metrics.length > 0) {
          const latestDate = result.metrics[result.metrics.length - 1].date;
          setSelectedMetricDate((current) =>
            current && result.metrics.some((metric) => metric.date === current)
              ? current
              : latestDate,
          );
          setTrendWindowStart((current) => {
            if (!current) {
              return latestDate;
            }

            return current;
          });
        } else {
          setSelectedMetricDate("");
          setTrendWindowStart("");
        }

        if (result.failedCount > 0 && result.metrics.length === 0) {
          setMetricsError("ML chart data is not ready for this student yet.");
        }
      } catch (loadMetricsError) {
        if (!isCancelled) {
          setMetricsError(getApiErrorMessage(loadMetricsError));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMetrics(false);
        }
      }
    }

    void loadReportMetrics();

    return () => {
      isCancelled = true;
    };
  }, [profileData]);

  const reportDateOptions = useMemo(() => getReportDateOptions(metrics), [metrics]);
  const selectedMetric = useMemo(
    () => getMetricForDate(metrics, selectedMetricDate || null),
    [metrics, selectedMetricDate],
  );
  const trendData = useMemo(
    () => (trendWindowStart ? getFiveDayWindow(metrics, trendWindowStart) : []),
    [metrics, trendWindowStart],
  );
  const canGoBack = useMemo(() => {
    if (!trendWindowStart || metrics.length === 0) {
      return false;
    }

    return trendWindowStart > metrics[0].date;
  }, [metrics, trendWindowStart]);
  const canGoForward = useMemo(() => {
    if (!trendWindowStart || metrics.length === 0) {
      return false;
    }

    return trendWindowStart < metrics[metrics.length - 1].date;
  }, [metrics, trendWindowStart]);

  if (isLoading) {
    return (
      <DashboardPage eyebrow="Teacher / Child Profiles" title="Profile Details">
        <DashboardLoadingState label="Loading student profile..." />
      </DashboardPage>
    );
  }

  if (error || !profileData) {
    return (
      <DashboardPage eyebrow="Teacher / Child Profiles" title="Profile Details">
        <DashboardErrorState
          title="Could not load profile"
          description={error || "An unexpected error occurred."}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                void loadProfile();
              }}
            >
              Retry
            </Button>
          }
        />
      </DashboardPage>
    );
  }

  const { student, milestones, reports } = profileData;
  const studentName = getTeacherStudentDisplayName(student);
  const studentAge = getTeacherStudentAge(student) ?? 0;

  const enrolledDateStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(student.createdAt));

  async function openReport(jobId: string) {
    setLoadingReportJobId(jobId);
    setReportError(null);

    try {
      const access = await teacherService.getStudentReportAccess(studentId, jobId);
      const targetUrl = access.previewUrl || access.downloadUrl;

      if (!targetUrl) {
        throw new Error("Report URL is not available yet.");
      }

      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (openError) {
      setReportError(getApiErrorMessage(openError));
    } finally {
      setLoadingReportJobId(null);
    }
  }

  function shiftTrendWindow(direction: -1 | 1) {
    if (!trendWindowStart) {
      return;
    }

    const nextDate = new Date(`${trendWindowStart}T00:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + direction * 5);
    setTrendWindowStart(nextDate.toISOString().slice(0, 10));
  }

  return (
    <DashboardPage
      eyebrow="Teacher / Child Profiles"
      title={`${studentName}'s Profile`}
    >
      <div className="mx-auto max-w-7xl min-w-0">
        <ProfileHeader
          name={studentName}
          age={studentAge}
          enrolledDate={enrolledDateStr}
        />

        <div className="grid min-w-0 gap-8">
          <MlActivityTrendChart
            data={trendData}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onPrevious={() => shiftTrendWindow(-1)}
            onNext={() => shiftTrendWindow(1)}
          />

          <div className="grid min-w-0 gap-6 xl:grid-cols-[320px_1fr]">
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-5">
              <label
                htmlFor="ml-report-date"
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]"
              >
                Report Date
              </label>
              <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                Pick a day and refresh the bar chart with that day&apos;s ML
                report totals.
              </p>
              <Select
                id="ml-report-date"
                className="mt-4"
                value={selectedMetricDate}
                onChange={(event) => setSelectedMetricDate(event.target.value)}
                disabled={reportDateOptions.length === 0}
              >
                {reportDateOptions.length === 0 ? (
                  <option value="">No report dates</option>
                ) : null}
                {reportDateOptions.map((date) => (
                  <option key={date} value={date}>
                    {new Intl.DateTimeFormat("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(`${date}T00:00:00Z`))}
                  </option>
                ))}
              </Select>
            </div>

            <MlDailyActivityChart metric={selectedMetric} />
          </div>

          {isLoadingMetrics ? (
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-4 text-sm text-[var(--on-surface-variant)]">
              Loading ML chart data...
            </div>
          ) : null}

          {metricsError ? <MutationFeedback message={metricsError} /> : null}

          <div className="rounded-[2rem] bg-[var(--surface-container-low)] p-6 shadow-inner">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                ML Reports
              </span>
              <span className="text-sm text-[var(--on-surface-variant)]">
                {reports.length} report{reports.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div
                    key={report.jobId}
                    className="flex flex-col gap-3 rounded-[1.5rem] bg-[var(--surface-container-lowest)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--on-surface)]">
                        <FileText className="size-4" />
                        PDF Report
                      </div>
                      <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                        Video ID {report.trackId} -{" "}
                        {new Date(report.recordingStartedAt).toLocaleString(
                          "en-US",
                        )}
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      disabled={loadingReportJobId === report.jobId}
                      onClick={() => void openReport(report.jobId)}
                    >
                      <ExternalLink />
                      {loadingReportJobId === report.jobId
                        ? "Opening..."
                        : "Open PDF"}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] bg-[var(--surface-container-lowest)] p-4 text-sm text-[var(--on-surface-variant)]">
                  No ML report has been matched to this student yet.
                </div>
              )}
            </div>

            {reportError ? (
              <MutationFeedback className="mt-4" message={reportError} />
            ) : null}
          </div>

          <div className="grid min-w-0 gap-10">

            <MilestonesList milestones={milestones} />
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
