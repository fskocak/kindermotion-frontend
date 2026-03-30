"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardLoadingState } from "@/components/dashboard/dashboard-loading-state";
import { DashboardPagination } from "@/components/dashboard/dashboard-pagination";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Button } from "@/components/ui/button";
import { FormActions } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MutationFeedback } from "@/components/ui/mutation-feedback";
import { useToast } from "@/components/providers/toast-provider";
import { Select } from "@/components/ui/select";
import { AdminClassCard } from "@/features/admin/components/admin-class-card";
import { AdminClassDeleteModal } from "@/features/admin/components/admin-class-delete-modal";
import { AdminClassEditModal } from "@/features/admin/components/admin-class-edit-modal";
import {
  createClassSchema,
  type CreateClassFormValues,
} from "@/features/admin/schemas/create-class-schema";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { adminService } from "@/services";
import type { PaginationMeta } from "@/types/api";
import type { AdminClass, AdminTeacher } from "@/types/admin";

const CLASSES_PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function AdminClassesPageContent() {
  const toast = useToast();
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: CLASSES_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [selectedClass, setSelectedClass] = useState<AdminClass | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const form = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: "",
      teacherId: "",
    },
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  async function loadTeachers() {
    const teachersData = await adminService.listTeachers({
      page: 1,
      limit: 100,
    });

    setTeachers(teachersData.items);
  }

  async function loadClasses(
    page = currentPage,
    search = debouncedSearch,
    teacherId = selectedTeacherFilter,
  ) {
    try {
      setListError(null);
      const classesData = await adminService.listClasses({
        page,
        limit: CLASSES_PAGE_LIMIT,
        search,
        teacherId: teacherId === "all" ? undefined : teacherId,
      });

      if (classesData.meta.total > 0 && page > classesData.meta.totalPages) {
        setCurrentPage(classesData.meta.totalPages);
        return;
      }

      setClasses(classesData.items);
      setPaginationMeta(classesData.meta);
    } catch (error) {
      setListError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function bootstrapPage() {
      try {
        setListError(null);
        const [classesData, teachersData] = await Promise.all([
          adminService.listClasses({
            page: currentPage,
            limit: CLASSES_PAGE_LIMIT,
            search: debouncedSearch,
            teacherId:
              selectedTeacherFilter === "all"
                ? undefined
                : selectedTeacherFilter,
          }),
          adminService.listTeachers({
            page: 1,
            limit: 100,
          }),
        ]);

        if (!isActive) {
          return;
        }

        if (classesData.meta.total > 0 && currentPage > classesData.meta.totalPages) {
          setCurrentPage(classesData.meta.totalPages);
          return;
        }

        setClasses(classesData.items);
        setPaginationMeta(classesData.meta);
        setTeachers(teachersData.items);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setListError(getApiErrorMessage(error));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    void bootstrapPage();

    return () => {
      isActive = false;
    };
  }, [currentPage, debouncedSearch, selectedTeacherFilter]);

  async function onSubmit(values: CreateClassFormValues) {
    setSubmitError(null);

    try {
      await adminService.createClass(values);
      toast.success("Class created successfully.");
      form.reset();
      await Promise.all([
        loadClasses(currentPage, debouncedSearch, selectedTeacherFilter),
        loadTeachers(),
      ]);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  async function handleMutationSuccess(feedback: string) {
    toast.success(feedback);
    await Promise.all([
      loadClasses(currentPage, debouncedSearch, selectedTeacherFilter),
      loadTeachers(),
    ]);
  }

  const hasActiveFilters =
    debouncedSearch.length > 0 || selectedTeacherFilter !== "all";

  return (
    <DashboardPage
      eyebrow="Admin / Classes"
      title="Keep class structures organized in one operational surface."
      description="This MVP screen lets admins review classes, assign a teacher when creating one, and keep the class list aligned with backend state."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardSectionCard
          eyebrow="Class Directory"
          title="Classes"
          description="Current classes powered by backend search, optional teacher filtering, and pagination."
          actions={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                void Promise.all([
                  loadClasses(currentPage, debouncedSearch, selectedTeacherFilter),
                  loadTeachers(),
                ]);
              }}
            >
              Refresh
            </Button>
          }
        >
          <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)_auto] lg:items-end">
            <div className="grid gap-2">
              <Label htmlFor="class-search">Search classes</Label>
              <Input
                id="class-search"
                type="search"
                placeholder="Search by class or teacher"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="class-teacher-filter">Teacher filter</Label>
              <Select
                id="class-teacher-filter"
                value={selectedTeacherFilter}
                onChange={(event) => {
                  setSelectedTeacherFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All teachers</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName} ({teacher.email})
                  </option>
                ))}
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput("");
                setSelectedTeacherFilter("all");
                setCurrentPage(1);
              }}
              disabled={!hasActiveFilters}
            >
              Clear filters
            </Button>
          </div>

          {!isLoading && !listError ? (
            <div className="mb-5 rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
              {hasActiveFilters
                ? `Showing ${paginationMeta.total} matching class result${paginationMeta.total === 1 ? "" : "s"} across ${paginationMeta.totalPages} page${paginationMeta.totalPages === 1 ? "" : "s"}.`
                : `Showing ${paginationMeta.total} class result${paginationMeta.total === 1 ? "" : "s"} across ${paginationMeta.totalPages} page${paginationMeta.totalPages === 1 ? "" : "s"}.`}
            </div>
          ) : null}

          {isLoading ? (
            <DashboardLoadingState label="Loading classes and teachers..." />
          ) : listError ? (
            <DashboardErrorState
              title="Could not load classes"
              description={listError}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    void Promise.all([
                      loadClasses(
                        currentPage,
                        debouncedSearch,
                        selectedTeacherFilter,
                      ),
                      loadTeachers(),
                    ]);
                  }}
                >
                  Retry
                </Button>
              }
            />
          ) : classes.length === 0 && hasActiveFilters ? (
            <DashboardEmptyState
              title="No classes match the current filters"
              description="Try a different search term, choose another teacher, or clear the filters to return to the full class directory."
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    setSelectedTeacherFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : classes.length === 0 ? (
            <DashboardEmptyState
              title="No classes yet"
              description="Create the first class from the form on the right once at least one teacher account exists."
            />
          ) : (
            <div className="grid gap-4">
              {classes.map((classItem) => (
                <AdminClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onEdit={(item) => {
                    setSelectedClass(item);
                    setEditModalOpen(true);
                  }}
                  onDelete={(item) => {
                    setSelectedClass(item);
                    setDeleteModalOpen(true);
                  }}
                />
              ))}

              <DashboardPagination
                page={paginationMeta.page}
                totalPages={paginationMeta.totalPages}
                total={paginationMeta.total}
                itemLabel="class"
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

        <DashboardSectionCard
          eyebrow="Create Class"
          title="Add a new class"
          description="Class creation is wired to the existing admin endpoint and uses teacher selection from the current teacher list."
        >
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="class-name">Class name</Label>
              <Input
                id="class-name"
                placeholder="Sunflowers"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="text-sm text-[var(--error)]">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="class-teacher">Assigned teacher</Label>
              <Select id="class-teacher" {...form.register("teacherId")}>
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName} ({teacher.email})
                  </option>
                ))}
              </Select>
              {form.formState.errors.teacherId ? (
                <p className="text-sm text-[var(--error)]">
                  {form.formState.errors.teacherId.message}
                </p>
              ) : null}
            </div>

            {teachers.length === 0 && !isLoading && !listError ? (
              <DashboardEmptyState
                title="No teachers available"
                description="Create at least one teacher before creating a class, because the backend requires a teacherId for class creation."
              />
            ) : null}

            {submitError ? <MutationFeedback message={submitError} /> : null}

            <FormActions
              submitLabel="Create class"
              submittingLabel="Creating..."
              isSubmitting={form.formState.isSubmitting}
              isSubmitDisabled={teachers.length === 0}
            />
          </form>
        </DashboardSectionCard>
      </div>

      <AdminClassEditModal
        key={selectedClass ? `${selectedClass.id}-${editModalOpen}` : "edit-class-empty"}
        open={editModalOpen}
        classItem={selectedClass}
        teachers={teachers}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedClass(null);
        }}
        onSuccess={() => handleMutationSuccess("Class updated successfully.")}
      />

      <AdminClassDeleteModal
        key={
          selectedClass ? `${selectedClass.id}-${deleteModalOpen}` : "delete-class-empty"
        }
        open={deleteModalOpen}
        classItem={selectedClass}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedClass(null);
        }}
        onSuccess={() => handleMutationSuccess("Class deleted successfully.")}
      />
    </DashboardPage>
  );
}
