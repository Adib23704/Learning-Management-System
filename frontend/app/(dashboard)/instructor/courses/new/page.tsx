"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants/routes";
import {
  type CreateCourseInput,
  createCourseSchema,
} from "@/lib/validators/course.schema";
import { useGetCategoriesQuery } from "@/store/api/categories.api";
import { useCreateCourseMutation } from "@/store/api/courses.api";

export default function NewCoursePage() {
  const router = useRouter();
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  const categories = categoriesData?.data ?? categoriesData ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
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
    if (isFree) {
      setValue("price", 0);
    }
  }, [isFree, setValue]);

  async function onSubmit(data: CreateCourseInput) {
    try {
      const course = await createCourse(data).unwrap();
      toast.success("Course created successfully!");
      router.push(ROUTES.INSTRUCTOR.EDIT_COURSE(course.id));
    } catch {
      toast.error("Failed to create course. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Course"
        description="Fill in the details below to create a new course."
        actions={
          <Button variant="outline" asChild>
            <Link href={ROUTES.INSTRUCTOR.COURSES}>
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
        }
      />

      <Card className="mx-auto max-w-2xl">
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

            <FormField label="Description" error={errors.description?.message}>
              <Textarea
                placeholder="Describe what students will learn in this course..."
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
                  onValueChange={(value) => setValue("categoryId", value)}
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
                  onCheckedChange={(checked) => setValue("isFree", checked)}
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

            <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(ROUTES.INSTRUCTOR.COURSES)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreating}>
                Create Course
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
