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
import { AdminTeacherCard } from "@/features/admin/components/admin-teacher-card";
import { AdminTeacherDeleteModal } from "@/features/admin/components/admin-teacher-delete-modal";
import { AdminTeacherEditModal } from "@/features/admin/components/admin-teacher-edit-modal";
import {
  createTeacherSchema,
  type CreateTeacherFormValues,
} from "@/features/admin/schemas/create-teacher-schema";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { adminService } from "@/services";
import type { PaginationMeta } from "@/types/api";
import type { AdminTeacher } from "@/types/admin";

const TEACHERS_PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function AdminTeachersPageContent() {
  const toast = useToast();
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: TEACHERS_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacher | null>(
    null,
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const form = useForm<CreateTeacherFormValues>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
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

  async function loadTeachers(page = currentPage, search = debouncedSearch) {
    try {
      setListError(null);
      const data = await adminService.listTeachers({
        page,
        limit: TEACHERS_PAGE_LIMIT,
        search,
      });

      if (data.meta.total > 0 && page > data.meta.totalPages) {
        setCurrentPage(data.meta.totalPages);
        return;
      }

      setTeachers(data.items);
      setPaginationMeta(data.meta);
    } catch (error) {
      setListError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadTeachersOnQueryChange() {
      try {
        setListError(null);
        const data = await adminService.listTeachers({
          page: currentPage,
          limit: TEACHERS_PAGE_LIMIT,
          search: debouncedSearch,
        });

        if (!isActive) {
          return;
        }

        if (data.meta.total > 0 && currentPage > data.meta.totalPages) {
          setCurrentPage(data.meta.totalPages);
          return;
        }

        setTeachers(data.items);
        setPaginationMeta(data.meta);
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
    void loadTeachersOnQueryChange();

    return () => {
      isActive = false;
    };
  }, [currentPage, debouncedSearch]);

  async function onSubmit(values: CreateTeacherFormValues) {
    setSubmitError(null);

    try {
      await adminService.createTeacher(values);
      toast.success("Teacher created successfully.");
      form.reset();
      await loadTeachers(currentPage, debouncedSearch);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  async function handleMutationSuccess(feedback: string) {
    toast.success(feedback);
    await loadTeachers(currentPage, debouncedSearch);
  }

  const hasActiveSearch = debouncedSearch.length > 0;

  return (
    <DashboardPage
      eyebrow="Admin / Teachers"
      title="Manage teacher accounts from one protected workspace."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardSectionCard
          eyebrow="Teacher Directory"
          title="Teachers"
          actions={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                void loadTeachers(currentPage, debouncedSearch);
              }}
            >
              Refresh
            </Button>
          }
        >
          <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="teacher-search">Search teachers</Label>
              <Input
                id="teacher-search"
                type="search"
                placeholder="Search by full name or email"
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

          {!isLoading && !listError ? (
            <div className="mb-5 rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface-variant)]">
              {hasActiveSearch
                ? `Showing ${paginationMeta.total} matching teacher result${paginationMeta.total === 1 ? "" : "s"} for "${debouncedSearch}".`
                : `Showing ${paginationMeta.total} teacher account${paginationMeta.total === 1 ? "" : "s"} across ${paginationMeta.totalPages} page${paginationMeta.totalPages === 1 ? "" : "s"}.`}
            </div>
          ) : null}

          {isLoading ? (
            <DashboardLoadingState label="Loading teachers..." />
          ) : listError ? (
            <DashboardErrorState
              title="Could not load teachers"
              description={listError}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    void loadTeachers(currentPage, debouncedSearch);
                  }}
                >
                  Retry
                </Button>
              }
            />
          ) : teachers.length === 0 && hasActiveSearch ? (
            <DashboardEmptyState
              title="No teachers match this search"
              description="Try a different full name or email fragment, or clear the current search to return to the full teacher directory."
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
          ) : teachers.length === 0 ? (
            <DashboardEmptyState
              title="No teachers yet"
              description="Create the first teacher account from the form on the right to populate this section."
            />
          ) : (
            <div className="grid gap-4">
              {teachers.map((teacher) => (
                <AdminTeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  onEdit={(item) => {
                    setSelectedTeacher(item);
                    setEditModalOpen(true);
                  }}
                  onDelete={(item) => {
                    setSelectedTeacher(item);
                    setDeleteModalOpen(true);
                  }}
                />
              ))}

              <DashboardPagination
                page={paginationMeta.page}
                totalPages={paginationMeta.totalPages}
                total={paginationMeta.total}
                itemLabel="teacher"
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
          eyebrow="Create Teacher"
          title="Add a new teacher"
        >
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="teacher-full-name">Full name</Label>
              <Input id="teacher-full-name" {...form.register("fullName")} />
              {form.formState.errors.fullName ? (
                <p className="text-sm text-[var(--error)]">
                  {form.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="teacher-email">Email</Label>
              <Input
                id="teacher-email"
                type="email"
                autoComplete="email"
                placeholder="teacher@kindermotion.com"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-sm text-[var(--error)]">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="teacher-password">Password</Label>
              <Input
                id="teacher-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-[var(--error)]">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {submitError ? <MutationFeedback message={submitError} /> : null}

            <FormActions
              submitLabel="Create teacher"
              submittingLabel="Creating..."
              isSubmitting={form.formState.isSubmitting}
            />
          </form>
        </DashboardSectionCard>
      </div>

      <AdminTeacherEditModal
        key={selectedTeacher ? `${selectedTeacher.id}-${editModalOpen}` : "edit-empty"}
        open={editModalOpen}
        teacher={selectedTeacher}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTeacher(null);
        }}
        onSuccess={() => handleMutationSuccess("Teacher updated successfully.")}
      />

      <AdminTeacherDeleteModal
        key={
          selectedTeacher ? `${selectedTeacher.id}-${deleteModalOpen}` : "delete-empty"
        }
        open={deleteModalOpen}
        teacher={selectedTeacher}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTeacher(null);
        }}
        onSuccess={() => handleMutationSuccess("Teacher deleted successfully.")}
      />
    </DashboardPage>
  );
}
