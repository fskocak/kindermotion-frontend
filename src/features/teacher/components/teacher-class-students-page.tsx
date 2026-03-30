"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardPagination } from "@/components/dashboard/dashboard-pagination";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeacherStudentCard } from "@/features/teacher/components/teacher-student-card";
import { TeacherStudentCreateModal } from "@/features/teacher/components/teacher-student-create-modal";
import { TeacherStudentDeleteModal } from "@/features/teacher/components/teacher-student-delete-modal";
import { TeacherStudentDetailModal } from "@/features/teacher/components/teacher-student-detail-modal";
import { TeacherStudentEditModal } from "@/features/teacher/components/teacher-student-edit-modal";
import { formatDateTime } from "@/lib/format/date-time";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { APP_ROUTES } from "@/lib/constants/routes";
import { teacherService } from "@/services";
import type { PaginationMeta } from "@/types/api";
import type { TeacherClass, TeacherStudent } from "@/types/teacher";

type TeacherClassStudentsPageProps = {
  classId: string;
};

const STUDENTS_PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function TeacherClassStudentsPage({
  classId,
}: TeacherClassStudentsPageProps) {
  const toast = useToast();
  const [classContext, setClassContext] = useState<TeacherClass | null>(null);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: STUDENTS_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(
    null,
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  async function loadStudents(page = currentPage, search = debouncedSearch) {
    try {
      setError(null);
      const response = await teacherService.getClassStudents(classId, {
        page,
        limit: STUDENTS_PAGE_LIMIT,
        search,
      });

      if (response.meta.total > 0 && page > response.meta.totalPages) {
        setCurrentPage(response.meta.totalPages);
        return response;
      }

      setClassContext(response.class);
      setStudents(response.items);
      setPaginationMeta(response.meta);
      setSelectedStudent((current) =>
        current
          ? response.items.find((student) => student.id === current.id) ?? null
          : null,
      );

      return response;
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadStudentsOnQueryChange() {
      try {
        setError(null);
        const response = await teacherService.getClassStudents(classId, {
          page: currentPage,
          limit: STUDENTS_PAGE_LIMIT,
          search: debouncedSearch,
        });

        if (!isActive) {
          return;
        }

        if (response.meta.total > 0 && currentPage > response.meta.totalPages) {
          setCurrentPage(response.meta.totalPages);
          return;
        }

        setClassContext(response.class);
        setStudents(response.items);
        setPaginationMeta(response.meta);
        setSelectedStudent((current) =>
          current
            ? response.items.find((student) => student.id === current.id) ?? null
            : null,
        );
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(getApiErrorMessage(loadError));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    void loadStudentsOnQueryChange();

    return () => {
      isActive = false;
    };
  }, [classId, currentPage, debouncedSearch]);

  const hasActiveSearch = debouncedSearch.length > 0;

  return (
    <DashboardPage
      eyebrow="Teacher / Class Students"
      title={classContext?.name ?? "Class students"}
      description={
        classContext
          ? `Review and maintain the students for ${classContext.name}. This screen only consumes teacher-owned classroom data from the protected API.`
          : "Review and maintain the students for a selected class from your teacher-owned classroom list."
      }
    >
      <div className="grid gap-6">
        <DashboardSectionCard
          eyebrow="Navigation"
          title="Back to your classes"
          description="Return to the teacher class list or reload the current class students view."
          actions={
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={APP_ROUTES.teacherClasses}>Back to My Classes</Link>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsLoading(true);
                  void loadStudents(currentPage, debouncedSearch);
                }}
              >
                Refresh
              </Button>
            </div>
          }
        >
          <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5 text-sm leading-6 text-[var(--on-surface-variant)]">
            {classContext
              ? `Class created ${formatDateTime(classContext.createdAt)}.`
              : "Open a class from the My Classes page to view its students."}
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Students"
          title="Class students"
          description="Review student records, search within the class roster, and update care information for this teacher-owned class."
          actions={
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setCreateModalOpen(true);
              }}
            >
              Add student
            </Button>
          }
        >
          <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="student-search">Search students</Label>
              <Input
                id="student-search"
                type="search"
                placeholder="Search by student full name"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput("");
                setCurrentPage(1);
              }}
              disabled={searchInput.length === 0 && debouncedSearch.length === 0}
            >
              Clear search
            </Button>
          </div>

          {!isLoading && !error ? (
            <div className="mb-5 rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
              {hasActiveSearch
                ? `Showing ${paginationMeta.total} matching student result${paginationMeta.total === 1 ? "" : "s"} for "${debouncedSearch}".`
                : `Showing ${paginationMeta.total} student record${paginationMeta.total === 1 ? "" : "s"} across ${paginationMeta.totalPages} page${paginationMeta.totalPages === 1 ? "" : "s"}.`}
            </div>
          ) : null}

          {isLoading ? (
            <DashboardLoadingState label="Loading class students..." />
          ) : error ? (
            <DashboardErrorState
              title="Could not load class students"
              description={error}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    void loadStudents(currentPage, debouncedSearch);
                  }}
                >
                  Retry
                </Button>
              }
            />
          ) : students.length === 0 && hasActiveSearch ? (
            <DashboardEmptyState
              title="No students match this search"
              description="Try a different student name, or clear the current search to return to the full class roster."
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    setCurrentPage(1);
                  }}
                >
                  Clear search
                </Button>
              }
            />
          ) : students.length === 0 ? (
            <DashboardEmptyState
              title="No students in this class"
              description="Students will appear here once the selected class has enrolled records."
            />
          ) : (
            <div className="grid gap-4">
              {students.map((student) => (
                <TeacherStudentCard
                  key={student.id}
                  student={student}
                  onViewDetails={(item) => {
                    setSelectedStudent(item);
                    setDetailModalOpen(true);
                  }}
                  onEdit={(item) => {
                    setSelectedStudent(item);
                    setEditModalOpen(true);
                  }}
                  onDelete={(item) => {
                    setSelectedStudent(item);
                    setDeleteModalOpen(true);
                  }}
                />
              ))}

              <DashboardPagination
                page={paginationMeta.page}
                totalPages={paginationMeta.totalPages}
                total={paginationMeta.total}
                itemLabel="student"
                onPrevious={() => {
                  setCurrentPage((page) => Math.max(1, page - 1));
                }}
                onNext={() => {
                  setCurrentPage((page) =>
                    Math.min(paginationMeta.totalPages, page + 1),
                  );
                }}
              />
            </div>
          )}
        </DashboardSectionCard>
      </div>

      <TeacherStudentCreateModal
        key={createModalOpen ? "create-open" : "create-closed"}
        open={createModalOpen}
        classId={classId}
        onClose={() => {
          setCreateModalOpen(false);
        }}
        onSuccess={async () => {
          toast.success("Student created successfully.");
          setIsLoading(true);
          await loadStudents(currentPage, debouncedSearch);
        }}
      />

      <TeacherStudentDetailModal
        key={
          selectedStudent ? `${selectedStudent.id}-${detailModalOpen}` : "detail-empty"
        }
        open={detailModalOpen}
        student={selectedStudent}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedStudent(null);
        }}
      />

      <TeacherStudentEditModal
        key={selectedStudent ? `${selectedStudent.id}-${editModalOpen}` : "edit-empty"}
        open={editModalOpen}
        student={selectedStudent}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedStudent(null);
        }}
        onSuccess={async () => {
          toast.success("Student updated successfully.");
          setIsLoading(true);
          await loadStudents(currentPage, debouncedSearch);
        }}
      />

      <TeacherStudentDeleteModal
        key={
          selectedStudent ? `${selectedStudent.id}-${deleteModalOpen}` : "delete-empty"
        }
        open={deleteModalOpen}
        student={selectedStudent}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedStudent(null);
        }}
        onSuccess={async () => {
          toast.success("Student deleted successfully.");
          setIsLoading(true);
          await loadStudents(currentPage, debouncedSearch);
        }}
      />
    </DashboardPage>
  );
}
