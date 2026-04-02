"use client";

import { useCallback, useEffect, useState } from "react";

import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import {
  getTeacherStudentAge,
  getTeacherStudentDisplayName,
} from "@/features/teacher/student-utils";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type { TeacherStudentProfileResponse } from "@/types/teacher";

import { MilestonesList } from "./profile/milestones-list";
import { ProfileHeader } from "./profile/profile-header";
import { SkillProgressCard } from "./profile/skill-progress-card";
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

  const { student, activities, milestones } = profileData;
  const studentName = getTeacherStudentDisplayName(student);
  const studentAge = getTeacherStudentAge(student) ?? 0;

  const enrolledDateStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(student.createdAt));

  return (
    <DashboardPage
      eyebrow="Teacher / Child Profiles"
      title={`${studentName}'s Profile`}
    >
      <div className="mx-auto max-w-5xl min-w-0">
        <ProfileHeader
          name={studentName}
          age={studentAge}
          level={student.level ?? "Explorer"}
          enrolledDate={enrolledDateStr}
        />

        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="grid min-w-0 gap-8">
            <WeeklySummaryChart data={activities} />

            {/* End of Day Preview Card Placeholder */}
            <div className="flex h-32 items-end rounded-[2rem] bg-[var(--surface-container-low)] p-6 shadow-inner">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                End of Day Preview
              </span>
            </div>
          </div>

          <div className="grid min-w-0 gap-10">
            <SkillProgressCard
              dexterity={student.dexterityScore}
              balance={student.balanceScore}
              coordination={student.coordinationScore}
            />
            <MilestonesList milestones={milestones} />
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
