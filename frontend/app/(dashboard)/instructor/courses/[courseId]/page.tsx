"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Archive,
  ArrowLeft,
  ImagePlus,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants/routes";
import {
  type CreateCourseInput,
  createCourseSchema,
} from "@/lib/validators/course.schema";
import { useGetCategoriesQuery } from "@/store/api/categories.api";
import {
  useDeleteCourseMutation,
  useGetCourseQuery,
  useUpdateCourseMutation,
  useUpdateCourseStatusMutation,
  useUploadThumbnailMutation,
} from "@/store/api/courses.api";

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: course, isLoading: courseLoading } =
    useGetCourseQuery(courseId);
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [updateStatus, { isLoading: isStatusUpdating }] =
    useUpdateCourseStatusMutation();
  const [uploadThumbnail, { isLoading: isUploading }] =
    useUploadThumbnailMutation();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const categories = categoriesData?.data ?? categoriesData ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      price: 0,
      isFree: false,
    },
  });

  const isFree = watch("isFree");

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description ?? "",
        categoryId: course.categoryId ?? "",
        price: course.price,
        isFree: course.isFree,
      });
      setThumbnailPreview(course.thumbnailUrl);
    }
  }, [course, reset]);

  useEffect(() => {
    if (isFree) {
      setValue("price", 0);
    }
  }, [isFree, setValue]);

  async function onSubmit(data: CreateCourseInput) {
    try {
      await updateCourse({ id: courseId, body: data }).unwrap();
      toast.success("Course updated successfully!");
    } catch {
      toast.error("Failed to update course. Please try again.");
    }
  }

  async function handleDelete() {
    try {
      await deleteCourse(courseId).unwrap();
      toast.success("Course deleted successfully.");
      router.push(ROUTES.INSTRUCTOR.COURSES);
    } catch {
      toast.error("Failed to delete course. Please try again.");
    }
  }

  async function handleStatusChange() {
    if (!course) return;
    const newStatus = course.status === "DRAFT" ? "PUBLISHED" : "ARCHIVED";
    try {
      await updateStatus({ id: courseId, status: newStatus }).unwrap();
      toast.success(
        newStatus === "PUBLISHED"
          ? "Course published successfully!"
          : "Course archived successfully.",
      );
      setShowStatusDialog(false);
    } catch {
      toast.error("Failed to update course status.");
    }
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("thumbnail", file);

    try {
      await uploadThumbnail({ courseId, file: formData }).unwrap();
      toast.success("Thumbnail uploaded successfully!");
    } catch {
      toast.error("Failed to upload thumbnail.");
      setThumbnailPreview(course?.thumbnailUrl ?? null);
    }
  }

  if (courseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-500">Course not found.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href={ROUTES.INSTRUCTOR.COURSES}>Back to courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.title}
        description="Edit your course details, manage lessons, and view enrolled students."
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={course.status} />
            <Button variant="outline" asChild>
              <Link href={ROUTES.INSTRUCTOR.COURSES}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Thumbnail</CardTitle>
              <CardDescription>
                Upload an image to represent your course. Recommended size:
                1280x720px.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="relative h-36 w-64 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                  {thumbnailPreview ? (
                    <Image
                      src={thumbnailPreview}
                      alt="Course thumbnail"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus className="h-8 w-8 text-neutral-300" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploading}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                  <p className="text-xs text-neutral-400">
                    JPG, PNG or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  label="Course Title"
                  error={errors.title?.message}
                  required
                >
                  <Input
                    placeholder="e.g. Introduction to Web Development"
                    error={!!errors.title}
                    {...register("title")}
                  />
                </FormField>

                <FormField
                  label="Description"
                  error={errors.description?.message}
                >
                  <Textarea
                    placeholder="Describe what students will learn..."
                    rows={4}
                    error={!!errors.description}
                    {...register("description")}
                  />
                </FormField>

                <FormField
                  label="Category"
                  error={errors.categoryId?.message}
                  required
                >
                  {categoriesLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={watch("categoryId")}
                      onValueChange={(value) =>
                        setValue("categoryId", value, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(categories) ? categories : []).map(
                          (category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>

                <FormField label="Free Course">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isFree}
                      onCheckedChange={(checked) =>
                        setValue("isFree", checked, { shouldDirty: true })
                      }
                    />
                    <span className="text-sm text-neutral-500">
                      {isFree
                        ? "This course is free for all students"
                        : "Students will need to pay to enroll"}
                    </span>
                  </div>
                </FormField>

                <FormField
                  label="Price (USD)"
                  error={errors.price?.message}
                  required={!isFree}
                >
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    disabled={isFree}
                    error={!!errors.price}
                    {...register("price", { valueAsNumber: true })}
                  />
                </FormField>

                <div className="flex justify-end border-t border-neutral-100 pt-5">
                  <Button
                    type="submit"
                    isLoading={isUpdating}
                    disabled={!isDirty}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Actions</CardTitle>
              <CardDescription>
                Manage the status and lifecycle of your course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(course.status === "DRAFT" || course.status === "PUBLISHED") && (
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {course.status === "DRAFT"
                        ? "Publish Course"
                        : "Archive Course"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {course.status === "DRAFT"
                        ? "Make this course visible to students."
                        : "Remove this course from the catalog."}
                    </p>
                  </div>
                  <Button
                    variant={
                      course.status === "DRAFT" ? "primary" : "secondary"
                    }
                    size="sm"
                    onClick={() => setShowStatusDialog(true)}
                  >
                    {course.status === "DRAFT" ? (
                      <>
                        <Send className="h-4 w-4" /> Publish
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4" /> Archive
                      </>
                    )}
                  </Button>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-4">
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Delete Course
                  </p>
                  <p className="text-xs text-red-600/70">
                    Permanently delete this course and all its content. This
                    cannot be undone.
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-neutral-500">
                Manage your course lessons in a dedicated view.
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href={ROUTES.INSTRUCTOR.COURSE_LESSONS(courseId)}>
                  Manage Lessons
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-neutral-500">
                View students enrolled in this course.
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href={ROUTES.INSTRUCTOR.COURSE_STUDENTS(courseId)}>
                  View Students
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Course"
        description={`Are you sure you want to delete "${course.title}"? This will permanently remove all lessons, enrollments, and data associated with this course.`}
        onConfirm={handleDelete}
        confirmText="Delete Course"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        title={course.status === "DRAFT" ? "Publish Course" : "Archive Course"}
        description={
          course.status === "DRAFT"
            ? `Publishing "${course.title}" will make it visible to students. Are you ready?`
            : `Archiving "${course.title}" will prevent new enrollments. Existing students can still access the content.`
        }
        onConfirm={handleStatusChange}
        confirmText={course.status === "DRAFT" ? "Publish" : "Archive"}
        isLoading={isStatusUpdating}
      />
    </div>
  );
}
