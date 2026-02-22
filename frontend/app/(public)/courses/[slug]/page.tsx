"use client";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency } from "@/lib/utils/format";
import { useGetCourseQuery } from "@/store/api/courses.api";
import { useEnrollMutation } from "@/store/api/enrollments.api";
import { useGetLessonsQuery } from "@/store/api/lessons.api";
import type { Lesson } from "@/types";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useCurrentUser();

  const { data: course, isLoading } = useGetCourseQuery(slug);

  const { data: lessonsRaw } = useGetLessonsQuery(course?.id ?? "", {
    skip: !course?.id,
  });
  const lessons: Lesson[] = lessonsRaw ?? [];

  const [enroll, { isLoading: enrolling }] = useEnrollMutation();

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }
    if (!course) return;

    try {
      await enroll(course.id).unwrap();
      toast.success("Successfully enrolled!");
      router.push(ROUTES.STUDENT.COURSE(course.id));
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error.data?.message ?? "Could not enroll in this course");
    }
  };

  if (isLoading) {
    return (
      <section className="py-10">
        <Container>
          <Skeleton className="mb-4 h-8 w-64" />
          <Skeleton className="mb-2 h-5 w-96" />
          <Skeleton className="mt-8 h-64 w-full rounded-lg" />
        </Container>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="py-20">
        <Container>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-900">
              Course Not Found
            </h1>
            <p className="mt-2 text-neutral-500">
              This course may have been removed or the URL is incorrect.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href={ROUTES.COURSES}>Back to Catalog</Link>
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  const instructor = course.instructor;
  const instructorName = instructor
    ? `${instructor.firstName} ${instructor.lastName}`
    : "Unknown Instructor";

  return (
    <>
      <section className="bg-neutral-900 py-12 sm:py-16">
        <Container>
          <Link
            href={ROUTES.COURSES}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>

          <div className="grid items-start gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {course.category && (
                <Badge
                  variant="outline"
                  className="mb-4 border-neutral-600 text-neutral-300"
                >
                  {course.category.name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {course.title}
              </h1>
              {course.description && (
                <p className="mt-4 text-lg leading-relaxed text-neutral-300">
                  {course.description}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {course._count?.enrollments ?? 0} enrolled
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {course._count?.lessons ?? 0} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  By {instructorName}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-6">
              {course.thumbnailUrl && (
                <div className="relative mb-5 aspect-video overflow-hidden rounded-md">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <p className="mb-4 text-3xl font-bold text-white">
                {course.isFree ? "Free" : formatCurrency(course.price)}
              </p>
              {user?.role === "STUDENT" || !isAuthenticated ? (
                <Button
                  onClick={handleEnroll}
                  isLoading={enrolling}
                  size="lg"
                  className="w-full"
                >
                  {isAuthenticated ? "Enroll Now" : "Sign in to Enroll"}
                </Button>
              ) : (
                <p className="text-sm text-neutral-400">
                  Only students can enroll in courses.
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <h2 className="mb-6 text-2xl font-bold text-neutral-900">
            Curriculum
          </h2>
          {lessons.length === 0 ? (
            <p className="text-neutral-500">
              No lessons have been added to this course yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              {lessons.map((lesson, idx) => {
                const isPreview = lesson.isPreview;
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-4 px-5 py-4 ${
                      idx !== 0 ? "border-t border-neutral-100" : ""
                    } ${isPreview ? "bg-white" : "bg-neutral-50"}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-600">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-800 truncate">
                        {lesson.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                        {lesson.videoUrl && (
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" /> Video
                          </span>
                        )}
                        {lesson.content && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Text
                          </span>
                        )}
                      </div>
                    </div>
                    {isPreview ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Preview
                      </Badge>
                    ) : (
                      <Lock className="h-4 w-4 text-neutral-400" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Separator className="my-10" />

          {instructor && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900">
                Instructor
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-lg font-semibold text-accent-700">
                  {instructor.firstName?.[0]}
                  {instructor.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">
                    {instructorName}
                  </p>
                  <p className="text-sm text-neutral-500">Instructor</p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
