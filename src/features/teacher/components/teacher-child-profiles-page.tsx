"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, RefreshCcw } from "lucide-react";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  getTeacherStudentAge,
  getTeacherStudentDisplayName,
  getTeacherStudentGenderLabel,
  getTeacherStudentStatusLabel,
} from "@/features/teacher/student-utils";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { teacherService } from "@/services";
import type { TeacherClass, TeacherStudent } from "@/types/teacher";

const STUDENTS_LIMIT = 100;

type StudentProfileLinkCardProps = {
  student: TeacherStudent;
};

function StudentProfileLinkCard({ student }: StudentProfileLinkCardProps) {
  const studentName = getTeacherStudentDisplayName(student);
  const studentAge = getTeacherStudentAge(student);
  const studentGender = getTeacherStudentGenderLabel(student.gender);
  const studentStatus = getTeacherStudentStatusLabel(student.isActive);

  return (
    <article className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--on-surface)]">
            {studentName}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {student.studentId ? <Badge>Student #{student.studentId}</Badge> : null}
            <Badge variant={student.isActive === false ? "muted" : "primary"}>
              {studentStatus}
            </Badge>
            {studentAge !== null ? <Badge>Age {studentAge}</Badge> : null}
            {studentGender ? <Badge>{studentGender}</Badge> : null}
          </div>
        </div>

        <Button asChild size="sm" variant="secondary">
          <Link href={`/teacher/child-profiles/${student.id}`}>
            View profile
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function TeacherChildProfilesPageContent() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedClass = classes.find((classItem) => classItem.id === selectedClassId);

  const loadStudents = useCallback(async (background = false) => {
    if (!selectedClassId) {
      setStudents([]);
      setIsLoadingStudents(false);
      setIsRefreshing(false);
      return;
    }

    if (background) {
      setIsRefreshing(true);
    } else {
      setIsLoadingStudents(true);
    }

    try {
      setLoadError(null);
      const response = await teacherService.getClassStudents(selectedClassId, {
        limit: STUDENTS_LIMIT,
      });
      setStudents(response.items);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setIsLoadingStudents(false);
      setIsRefreshing(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    let isActive = true;

    async function loadClasses() {
      try {
        setLoadError(null);
        const response = await teacherService.listMyClasses();

        if (isActive) {
          setClasses(response);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(getApiErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoadingClasses(false);
        }
      }
    }

    void loadClasses();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoadingClasses) {
      void loadStudents();
    }
  }, [isLoadingClasses, loadStudents]);

  if (isLoadingClasses) {
    return (
      <DashboardPage
        eyebrow="Teacher / Child Profiles"
        title="Child profiles"
        description="Choose a classroom to view child profiles."
      >
        <DashboardLoadingState label="Loading classrooms..." />
      </DashboardPage>
    );
  }

  if (loadError && classes.length === 0) {
    return (
      <DashboardPage
        eyebrow="Teacher / Child Profiles"
        title="Child profiles"
        description="Choose a classroom to view child profiles."
      >
        <DashboardErrorState
          title="Could not load child profiles"
          description={loadError}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        />
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      eyebrow="Teacher / Child Profiles"
      title="Child profiles"
      description="Select one of your classrooms, then open a child's profile."
    >
      <DashboardSectionCard
        eyebrow="Classroom"
        title="Choose classroom"
        description="Only classrooms assigned to the signed-in teacher are available."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!selectedClassId || isRefreshing || isLoadingStudents}
            onClick={() => void loadStudents(true)}
          >
            <RefreshCcw className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      >
        <div className="grid gap-2 rounded-[1.5rem] bg-[var(--surface-container-low)] p-4">
          <Label htmlFor="child-profiles-classroom">Classroom</Label>
          <Select
            id="child-profiles-classroom"
            value={selectedClassId}
            onChange={(event) => {
              setSelectedClassId(event.target.value);
            }}
          >
            <option value="">Select classroom</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </Select>
        </div>
      </DashboardSectionCard>

      {selectedClassId ? (
        <DashboardSectionCard
          eyebrow="Children"
          title={selectedClass ? `${selectedClass.name} children` : "Children"}
          description="Open a child profile from the selected classroom."
        >
          {isLoadingStudents ? (
            <DashboardLoadingState label="Loading children..." />
          ) : loadError ? (
            <DashboardErrorState
              title="Could not load children"
              description={loadError}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void loadStudents()}
                >
                  Retry
                </Button>
              }
            />
          ) : students.length === 0 ? (
            <DashboardEmptyState
              title="No children found"
              description="This classroom does not have any children yet."
            />
          ) : (
            <div className="grid gap-4">
              {students.map((student) => (
                <StudentProfileLinkCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </DashboardSectionCard>
      ) : (
        <DashboardEmptyState
          title="Select a classroom"
          description="Choose one of your classrooms to load the children list."
        />
      )}
    </DashboardPage>
  );
}
