"use client";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  Play,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants/routes";
import { formatPercent } from "@/lib/utils/format";
import { useGetCourseQuery } from "@/store/api/courses.api";
import {
  useGetEnrollmentDetailQuery,
  useGetEnrollmentProgressQuery,
} from "@/store/api/enrollments.api";
import { useGetLessonsQuery } from "@/store/api/lessons.api";
import type { Lesson } from "@/types";

export default function StudentCourseViewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);

  const { data: course, isLoading: courseLoading } =
    useGetCourseQuery(courseId);
  const { data: lessons, isLoading: lessonsLoading } =
    useGetLessonsQuery(courseId);
  const { data: progressData, isLoading: progressLoading } =
    useGetEnrollmentProgressQuery(courseId);
  const { data: enrollment } = useGetEnrollmentDetailQuery(courseId);

  const isLoading = courseLoading || lessonsLoading || progressLoading;

  const sortedLessons = lessons
    ? [...lessons].sort((a, b) => a.order - b.order)
    : [];

  const completedLessonIds = new Set(
    progressData?.lessons
      ?.filter((lp) => lp.isCompleted)
      .map((lp) => lp.lessonId) ?? [],
  );

  const completedCount = completedLessonIds.size;
  const totalCount = sortedLessons.length;
  const overallProgress =
    enrollment?.progress ?? progressData?.enrollment?.progress ?? 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={ROUTES.STUDENT.COURSES}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to My Courses
        </Link>
      </Button>

      {isLoading ? (
        <CourseViewSkeleton />
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-neutral-800">
                  {course?.title}
                </h1>
                {course?.instructor && (
                  <p className="text-sm text-neutral-500">
                    by {course.instructor.firstName}{" "}
                    {course.instructor.lastName}
                  </p>
                )}
              </div>
              {enrollment && (
                <Badge
                  variant={
                    enrollment.status === "COMPLETED"
                      ? "success"
                      : enrollment.status === "ACTIVE"
                        ? "info"
                        : "warning"
                  }
                  size="md"
                >
                  {enrollment.status}
                </Badge>
              )}
            </div>

            {course?.description && (
              <p className="max-w-3xl text-sm leading-relaxed text-neutral-600">
                {course.description}
              </p>
            )}

            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-neutral-700">
                      Course Progress
                    </p>
                    <p className="text-xs text-neutral-500">
                      {completedCount} of {totalCount} lessons completed
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={overallProgress}
                      className="w-40 sm:w-56"
                    />
                    <span className="text-sm font-semibold text-neutral-800">
                      {formatPercent(overallProgress)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent-600" />
                Course Content
                <span className="text-sm font-normal text-neutral-400">
                  ({totalCount} {totalCount === 1 ? "lesson" : "lessons"})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {sortedLessons.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">
                  No lessons have been added to this course yet.
                </p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {sortedLessons.map((lesson, index) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      index={index}
                      courseId={courseId}
                      isCompleted={completedLessonIds.has(lesson.id)}
                      isLocked={enrollment?.status !== "ACTIVE"}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function LessonRow({
  lesson,
  index,
  courseId,
  isCompleted,
  isLocked,
}: {
  lesson: Lesson;
  index: number;
  courseId: string;
  isCompleted: boolean;
  isLocked: boolean;
}) {
  const hasVideo = Boolean(lesson.videoUrl);

  const content = (
    <div
      className={`flex items-center gap-4 px-2 py-3.5 transition-colors ${
        isLocked
          ? "cursor-default opacity-60"
          : "cursor-pointer rounded-lg hover:bg-neutral-50"
      }`}
    >
      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-accent-600" />
        ) : (
          <Circle className="h-5 w-5 text-neutral-300" />
        )}
      </div>

      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            isCompleted ? "text-neutral-500" : "text-neutral-800"
          }`}
        >
          {lesson.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
          {hasVideo ? (
            <span className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              Video
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Reading
            </span>
          )}
        </div>
      </div>

      {isCompleted && (
        <Badge variant="success" size="sm">
          Done
        </Badge>
      )}
    </div>
  );

  if (isLocked) {
    return content;
  }

  return (
    <Link href={ROUTES.STUDENT.LESSON(courseId, lesson.id)}>{content}</Link>
  );
}

function CourseViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-16 w-full max-w-3xl" />
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-2 w-56 rounded-full" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3.5">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
