"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { APP_ROUTES } from "@/lib/constants/routes";
import { authService, teacherService } from "@/services";
import { useAuthStore } from "@/store";
import type { AuthUser } from "@/types/auth";
import type { TeacherClass } from "@/types/teacher";

type TeacherProfileState = {
  teacher: AuthUser;
  classes: TeacherClass[];
};

function formatMonthYear(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function TeacherProfilePageContent() {
  const setUser = useAuthStore((state) => state.setUser);
  const [profile, setProfile] = useState<TeacherProfileState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setError(null);

      const [teacher, classes] = await Promise.all([
        authService.getMe(),
        teacherService.listMyClasses(),
      ]);

      setUser(teacher);
      setProfile({ teacher, classes });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <DashboardPage eyebrow="Teacher / My Profile" title="My Profile">
        <DashboardLoadingState label="Loading your profile..." />
      </DashboardPage>
    );
  }

  if (error || !profile) {
    return (
      <DashboardPage eyebrow="Teacher / My Profile" title="My Profile">
        <DashboardErrorState
          title="Could not load your profile"
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

  const { teacher, classes } = profile;
  const newestClass = classes[0] ?? null;

  return (
    <DashboardPage
      eyebrow="Teacher / My Profile"
      title={teacher.fullName}
      description="Your account details and classroom ownership are sourced from the current authenticated teacher session."
    >
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <DashboardSectionCard
          eyebrow="Identity"
          title="Account overview"
          actions={<Badge variant="primary">{teacher.role}</Badge>}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
              <p className="km-eyebrow mb-3 text-xs font-semibold">Full Name</p>
              <p className="text-2xl font-semibold tracking-[-0.03em] text-[var(--on-surface)]">
                {teacher.fullName}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                This is the name attached to your authenticated teacher account.
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
              <p className="km-eyebrow mb-3 text-xs font-semibold">Email</p>
              <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
                {teacher.email}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                Used for secure teacher sign in and session recovery flows.
              </p>
            </div>
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Workspace"
          title="Operational snapshot"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
              <p className="km-eyebrow mb-3 text-xs font-semibold">
                Member Since
              </p>
              <p className="text-2xl font-semibold tracking-[-0.03em] text-[var(--on-surface)]">
                {formatMonthYear(teacher.createdAt)}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                Account created on {formatFullDate(teacher.createdAt)}.
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5">
              <p className="km-eyebrow mb-3 text-xs font-semibold">
                Active Classes
              </p>
              <p className="text-2xl font-semibold tracking-[-0.03em] text-[var(--on-surface)]">
                {classes.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                Live class assignments currently connected to your teacher account.
              </p>
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <DashboardSectionCard
          eyebrow="Classes"
          title="Assigned classrooms"
          description="These classes come directly from your teacher-scoped class endpoint."
          actions={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                void loadProfile();
              }}
            >
              Refresh
            </Button>
          }
        >
          {classes.length === 0 ? (
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5 text-sm leading-6 text-[var(--on-surface-variant)]">
              No classes are currently assigned to this teacher account.
            </div>
          ) : (
            <div className="grid gap-4">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
                        {classItem.name}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                        Created {formatFullDate(classItem.createdAt)}
                      </p>
                    </div>
                    <Badge>{teacher.role}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Quick Access"
          title="Next best action"
        >
          <div className="grid gap-4">
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5 text-sm leading-6 text-[var(--on-surface-variant)]">
              {newestClass
                ? `${newestClass.name} is your most recently created class. Open your class workspace to continue reviewing students and daily activity.`
                : "Open your classes workspace once assignments are available to manage students and daily activity from one place."}
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
