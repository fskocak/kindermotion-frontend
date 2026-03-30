"use client";

import { useEffect, useState } from "react";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type { TeacherClass } from "@/types/teacher";
import { TeacherClassCard } from "@/features/teacher/components/teacher-class-card";

export function TeacherClassesPageContent() {
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
      eyebrow="Teacher / My Classes"
      title="Review the classes assigned to your account."
      description="This page loads real teacher-owned classes and gives you a direct path into the students view for each classroom."
    >
      <DashboardSectionCard
        eyebrow="Class Directory"
        title="My Classes"
        description="Classes are loaded from the teacher-scoped endpoint and ordered by most recently created."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              void loadClasses();
            }}
          >
            Refresh
          </Button>
        }
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
            description="You do not currently own any classes. Once classes are assigned to your teacher account, they will appear here."
          />
        ) : (
          <div className="grid gap-4">
            {classes.map((classItem) => (
              <TeacherClassCard key={classItem.id} classItem={classItem} />
            ))}
          </div>
        )}
      </DashboardSectionCard>
    </DashboardPage>
  );
}
