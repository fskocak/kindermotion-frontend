"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants/routes";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import { useAuthStore } from "@/store";
import type { TeacherClass } from "@/types/teacher";

export function TeacherDashboardHome() {
  const user = useAuthStore((state) => state.user);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadClasses() {
    try {
      setError(null);
      const data = await teacherService.listMyClasses();
      setClasses(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadClasses();
  }, []);

  return (
    <DashboardPage
      eyebrow="Teacher Dashboard"
      title={`Welcome back${user?.fullName ? `, ${user.fullName}` : ""}.`}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSectionCard
          eyebrow="Overview"
          title="Your classroom summary"
        >
          {isLoading ? (
            <DashboardLoadingState label="Loading your classes..." />
        ) : error ? (
          <DashboardErrorState
            title="Could not load your classes"
            description={error}
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsLoading(true);
                  void loadClasses();
                }}
              >
                Retry
              </Button>
            }
          />
        ) : classes.length === 0 ? (
          <DashboardEmptyState
              title="No classes assigned"
              description="You do not currently have any classes assigned to your account."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
                <p className="km-eyebrow mb-3 text-xs font-semibold">
                  Active Classes
                </p>
                <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--on-surface)]">
                  {classes.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                  The total number of classes currently assigned to you.
                </p>
              </div>

              <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
                <p className="km-eyebrow mb-3 text-xs font-semibold">
                  Primary Access
                </p>
                <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
                  {classes[0]?.name ?? "No classes"}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                  Your most recently created class is ready to open from the class
                  list page.
                </p>
              </div>
            </div>
          )}
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Quick Access"
          title="Go straight to your classes"
        >
          <div className="grid gap-4">
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5 text-sm leading-6 text-[var(--on-surface-variant)]">
              Open the class list to review your assigned classrooms and drill into
              the student view for any individual class.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={APP_ROUTES.teacherClasses}>Open My Classes</Link>
              </Button>
            </div>
          </div>
        </DashboardSectionCard>
      </div>
    </DashboardPage>
  );
}
