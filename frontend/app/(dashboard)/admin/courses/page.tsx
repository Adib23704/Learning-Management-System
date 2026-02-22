"use client";

import { Archive, Globe, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { useGetCategoriesQuery } from "@/store/api/categories.api";
import {
  useDeleteCourseMutation,
  useGetCoursesQuery,
  useUpdateCourseStatusMutation,
} from "@/store/api/courses.api";
import type { Course, CourseStatus } from "@/types";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    courseId: string;
    courseTitle: string;
  }>({ open: false, courseId: "", courseTitle: "" });
  const [statusConfirm, setStatusConfirm] = useState<{
    open: boolean;
    courseId: string;
    courseTitle: string;
    newStatus: CourseStatus;
  }>({ open: false, courseId: "", courseTitle: "", newStatus: "PUBLISHED" });

  const { data: coursesData, isLoading } = useGetCoursesQuery({
    search: search || undefined,
    status: statusFilter !== "ALL" ? (statusFilter as CourseStatus) : undefined,
    categoryId: categoryFilter !== "ALL" ? categoryFilter : undefined,
  });

  const { data: categoriesData } = useGetCategoriesQuery();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [updateCourseStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCourseStatusMutation();

  const courses = coursesData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(deleteConfirm.courseId).unwrap();
      toast.success("Course deleted successfully");
      setDeleteConfirm((prev) => ({ ...prev, open: false }));
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await updateCourseStatus({
        id: statusConfirm.courseId,
        status: statusConfirm.newStatus,
      }).unwrap();
      toast.success(
        `Course ${statusConfirm.newStatus === "PUBLISHED" ? "published" : "archived"} successfully`,
      );
      setStatusConfirm((prev) => ({ ...prev, open: false }));
    } catch {
      toast.error("Failed to update course status");
    }
  };

  const columns: Column<Record<string, unknown>>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
        render: (item) => {
          const c = item as unknown as Course;
          return (
            <div className="max-w-xs">
              <p className="truncate font-medium text-neutral-800">{c.title}</p>
            </div>
          );
        },
      },
      {
        key: "instructor",
        header: "Instructor",
        render: (item) => {
          const c = item as unknown as Course;
          return (
            <span className="text-neutral-600">
              {c.instructor
                ? `${c.instructor.firstName} ${c.instructor.lastName}`
                : "N/A"}
            </span>
          );
        },
      },
      {
        key: "category",
        header: "Category",
        render: (item) => {
          const c = item as unknown as Course;
          return (
            <span className="text-neutral-600">
              {c.category?.name ?? "Uncategorized"}
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        render: (item) => {
          const c = item as unknown as Course;
          return <StatusBadge status={c.status} type="course" />;
        },
      },
      {
        key: "enrollments",
        header: "Enrollments",
        render: (item) => {
          const c = item as unknown as Course;
          return (
            <span className="text-neutral-600">
              {formatNumber(c._count?.enrollments ?? 0)}
            </span>
          );
        },
      },
      {
        key: "price",
        header: "Price",
        render: (item) => {
          const c = item as unknown as Course;
          return (
            <span className="text-neutral-600">
              {c.isFree ? (
                <span className="text-accent-600 font-medium">Free</span>
              ) : (
                formatCurrency(c.price)
              )}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        render: (item) => {
          const c = item as unknown as Course;
          return (
            <div className="flex items-center justify-end gap-1">
              {c.status === "DRAFT" && (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Publish"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusConfirm({
                      open: true,
                      courseId: c.id,
                      courseTitle: c.title,
                      newStatus: "PUBLISHED",
                    });
                  }}
                >
                  <Globe className="h-4 w-4 text-accent-600" />
                </Button>
              )}
              {c.status === "PUBLISHED" && (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Archive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusConfirm({
                      open: true,
                      courseId: c.id,
                      courseTitle: c.title,
                      newStatus: "ARCHIVED",
                    });
                  }}
                >
                  <Archive className="h-4 w-4 text-neutral-500" />
                </Button>
              )}
              {c.status === "ARCHIVED" && (
                <Button
                  variant="ghost"
                  size="sm"
                  title="Republish"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusConfirm({
                      open: true,
                      courseId: c.id,
                      courseTitle: c.title,
                      newStatus: "PUBLISHED",
                    });
                  }}
                >
                  <Globe className="h-4 w-4 text-accent-600" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm({
                    open: true,
                    courseId: c.id,
                    courseTitle: c.title,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="View and manage all courses on the platform"
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={courses as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No courses found."
      />

      <ConfirmDialog
        open={statusConfirm.open}
        onOpenChange={(open) => setStatusConfirm((prev) => ({ ...prev, open }))}
        title={
          statusConfirm.newStatus === "PUBLISHED"
            ? "Publish Course"
            : "Archive Course"
        }
        description={
          statusConfirm.newStatus === "PUBLISHED"
            ? `Are you sure you want to publish "${statusConfirm.courseTitle}"? It will become visible to all students.`
            : `Are you sure you want to archive "${statusConfirm.courseTitle}"? It will no longer be visible to new students.`
        }
        confirmText={
          statusConfirm.newStatus === "PUBLISHED" ? "Publish" : "Archive"
        }
        onConfirm={handleUpdateStatus}
        isLoading={isUpdatingStatus}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}
        title="Delete Course"
        description={`Are you sure you want to delete "${deleteConfirm.courseTitle}"? This action cannot be undone and all associated data will be lost.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDeleteCourse}
        isLoading={isDeleting}
      />
    </div>
  );
}
