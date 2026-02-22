"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, BookOpen, Edit, Eye, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants/routes";
import { type LessonInput, lessonSchema } from "@/lib/validators/course.schema";
import { useGetCourseQuery } from "@/store/api/courses.api";
import {
  useCreateLessonMutation,
  useDeleteLessonMutation,
  useGetLessonsQuery,
  useUpdateLessonMutation,
} from "@/store/api/lessons.api";
import type { Lesson } from "@/types";

export default function ManageLessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  const { data: course } = useGetCourseQuery(courseId);
  const { data: lessons, isLoading } = useGetLessonsQuery(courseId);
  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: isUpdatingLesson }] =
    useUpdateLessonMutation();
  const [deleteLesson, { isLoading: isDeletingLesson }] =
    useDeleteLessonMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LessonInput>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      content: "",
      videoUrl: "",
      isPreview: false,
    },
  });

  const isPreview = watch("isPreview");

  function openCreateDialog() {
    setEditingLesson(null);
    reset({ title: "", content: "", videoUrl: "", isPreview: false });
    setDialogOpen(true);
  }

  function openEditDialog(lesson: Lesson) {
    setEditingLesson(lesson);
    reset({
      title: lesson.title,
      content: lesson.content ?? "",
      videoUrl: lesson.videoUrl ?? "",
      isPreview: lesson.isPreview,
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: LessonInput) {
    try {
      if (editingLesson) {
        await updateLesson({
          courseId,
          lessonId: editingLesson.id,
          ...data,
        }).unwrap();
        toast.success("Lesson updated successfully!");
      } else {
        await createLesson({ courseId, ...data }).unwrap();
        toast.success("Lesson created successfully!");
      }
      setDialogOpen(false);
      reset();
    } catch {
      toast.error(
        editingLesson ? "Failed to update lesson." : "Failed to create lesson.",
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteLesson({
        courseId,
        lessonId: deleteTarget.id,
      }).unwrap();
      toast.success("Lesson deleted successfully.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete lesson.");
    }
  }

  const sortedLessons = lessons
    ? [...lessons].sort((a, b) => a.order - b.order)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={course ? `Lessons: ${course.title}` : "Manage Lessons"}
        description="Add, edit, and organize your course lessons."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={ROUTES.INSTRUCTOR.EDIT_COURSE(courseId)}>
                <ArrowLeft className="h-4 w-4" />
                Back to Course
              </Link>
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Add Lesson
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 py-4">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedLessons.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No lessons yet"
          description="Start building your course by adding the first lesson."
          action={
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4" />
              Add Lesson
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {sortedLessons.map((lesson, index) => (
            <Card key={lesson.id} className="transition-shadow hover:shadow-sm">
              <CardContent className="flex items-center gap-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-sm font-semibold text-neutral-600">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-neutral-800">
                      {lesson.title}
                    </p>
                    {lesson.isPreview && (
                      <Badge variant="info" size="sm">
                        <Eye className="mr-1 h-3 w-3" />
                        Preview
                      </Badge>
                    )}
                  </div>
                  {lesson.videoUrl && (
                    <p className="mt-0.5 truncate text-xs text-neutral-400">
                      {lesson.videoUrl}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(lesson)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => setDeleteTarget(lesson)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Lesson Title"
              error={errors.title?.message}
              required
            >
              <Input
                placeholder="e.g. Getting Started"
                error={!!errors.title}
                {...register("title")}
              />
            </FormField>

            <FormField label="Content" error={errors.content?.message}>
              <Textarea
                placeholder="Lesson content or notes..."
                rows={4}
                error={!!errors.content}
                {...register("content")}
              />
            </FormField>

            <FormField label="Video URL" error={errors.videoUrl?.message}>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                error={!!errors.videoUrl}
                {...register("videoUrl")}
              />
            </FormField>

            <FormField label="Free Preview">
              <div className="flex items-center gap-3">
                <Switch
                  checked={isPreview}
                  onCheckedChange={(checked) => setValue("isPreview", checked)}
                />
                <span className="text-sm text-neutral-500">
                  {isPreview
                    ? "This lesson is available as a free preview"
                    : "Only enrolled students can access this lesson"}
                </span>
              </div>
            </FormField>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={editingLesson ? isUpdatingLesson : isCreating}
              >
                {editingLesson ? "Save Changes" : "Add Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Lesson"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeletingLesson}
      />
    </div>
  );
}
