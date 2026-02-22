"use client";

import {
  Archive,
  BookOpen,
  Edit,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  useDeleteCourseMutation,
  useGetCoursesQuery,
  useUpdateCourseStatusMutation,
} from "@/store/api/courses.api";
import type { Course, CourseStatus } from "@/types";

export default function InstructorCoursesPage() {
  const router = useRouter();
  const { data: coursesData, isLoading } = useGetCoursesQuery();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCourseStatusMutation();

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    course: Course;
    newStatus: CourseStatus;
  } | null>(null);

  const courses = coursesData?.data ?? [];

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCourse(deleteTarget.id).unwrap();
      toast.success("Course deleted successfully.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete course. Please try again.");
    }
  }

  async function handleStatusChange() {
    if (!statusTarget) return;
    try {
      await updateStatus({
        id: statusTarget.course.id,
        status: statusTarget.newStatus,
      }).unwrap();
      toast.success(
        statusTarget.newStatus === "PUBLISHED"
          ? "Course published successfully."
          : "Course archived successfully.",
      );
      setStatusTarget(null);
    } catch {
      toast.error("Failed to update course status. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="Create and manage your courses."
        actions={
          <Button asChild>
            <Link href={ROUTES.INSTRUCTOR.NEW_COURSE}>
              <Plus className="h-4 w-4" />
              Create Course
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Get started by creating your first course."
          action={
            <Button asChild size="sm">
              <Link href={ROUTES.INSTRUCTOR.NEW_COURSE}>
                <Plus className="h-4 w-4" />
                Create Course
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group relative transition-shadow hover:shadow-md"
            >
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-neutral-800">
                      {course.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {course.category?.name ?? "No category"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(ROUTES.INSTRUCTOR.EDIT_COURSE(course.id))
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            ROUTES.INSTRUCTOR.COURSE_LESSONS(course.id),
                          )
                        }
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Manage Lessons
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            ROUTES.INSTRUCTOR.COURSE_STUDENTS(course.id),
                          )
                        }
                      >
                        <Users className="mr-2 h-4 w-4" />
                        View Students
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {course.status === "DRAFT" && (
                        <DropdownMenuItem
                          onClick={() =>
                            setStatusTarget({
                              course,
                              newStatus: "PUBLISHED",
                            })
                          }
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {course.status === "PUBLISHED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            setStatusTarget({
                              course,
                              newStatus: "ARCHIVED",
                            })
                          }
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteTarget(course)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Users className="h-3.5 w-3.5" />
                  <span>{course._count?.enrollments ?? 0} students</span>
                  <span className="text-neutral-300">|</span>
                  <span>
                    {course.isFree ? "Free" : formatCurrency(course.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                  <StatusBadge status={course.status} />
                  <span className="text-xs text-neutral-400">
                    {formatDate(course.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Course"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone and will remove all associated lessons and enrollments.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={!!statusTarget}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={
          statusTarget?.newStatus === "PUBLISHED"
            ? "Publish Course"
            : "Archive Course"
        }
        description={
          statusTarget?.newStatus === "PUBLISHED"
            ? `Are you sure you want to publish "${statusTarget?.course.title}"? It will become visible to students.`
            : `Are you sure you want to archive "${statusTarget?.course.title}"? Students will no longer be able to enroll.`
        }
        onConfirm={handleStatusChange}
        confirmText={
          statusTarget?.newStatus === "PUBLISHED" ? "Publish" : "Archive"
        }
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}
