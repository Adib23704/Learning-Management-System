"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants/routes";
import { useGetCourseQuery } from "@/store/api/courses.api";
import {
  useGetEnrollmentProgressQuery,
  useMarkLessonCompleteMutation,
} from "@/store/api/enrollments.api";
import { useGetLessonQuery, useGetLessonsQuery } from "@/store/api/lessons.api";

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const _router = useRouter();

  const { data: course } = useGetCourseQuery(courseId);
  const { data: lesson, isLoading: lessonLoading } = useGetLessonQuery({
    courseId,
    lessonId,
  });
  const { data: allLessons, isLoading: lessonsLoading } =
    useGetLessonsQuery(courseId);
  const { data: progressData } = useGetEnrollmentProgressQuery(courseId);

  const [markComplete, { isLoading: isMarking }] =
    useMarkLessonCompleteMutation();

  const sortedLessons = useMemo(
    () => (allLessons ? [...allLessons].sort((a, b) => a.order - b.order) : []),
    [allLessons],
  );

  const currentIndex = useMemo(
    () => sortedLessons.findIndex((l) => l.id === lessonId),
    [sortedLessons, lessonId],
  );

  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < sortedLessons.length - 1
      ? sortedLessons[currentIndex + 1]
      : null;

  const completedLessonIds = useMemo(
    () =>
      new Set(
        progressData?.lessons
          ?.filter((lp) => lp.isCompleted)
          .map((lp) => lp.lessonId) ?? [],
      ),
    [progressData],
  );

  const isCurrentCompleted = completedLessonIds.has(lessonId);

  const embedUrl = lesson?.videoUrl ? getEmbedUrl(lesson.videoUrl) : null;

  const handleMarkComplete = useCallback(async () => {
    try {
      await markComplete({ courseId, lessonId }).unwrap();
    } catch {
      // Error handled by RTK Query
    }
  }, [markComplete, courseId, lessonId]);

  const isLoading = lessonLoading || lessonsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.STUDENT.COURSE(courseId)}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Course
          </Link>
        </Button>
        {!isLoading && sortedLessons.length > 0 && (
          <span className="text-xs text-neutral-400">
            Lesson {currentIndex + 1} of {sortedLessons.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <LessonPlayerSkeleton />
      ) : lesson ? (
        <>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-neutral-800">
                  {lesson.title}
                </h1>
                {course && (
                  <p className="mt-1 text-sm text-neutral-500">
                    {course.title}
                  </p>
                )}
              </div>
              {isCurrentCompleted ? (
                <Badge variant="success" size="md">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline" size="md">
                  <Circle className="mr-1 h-3.5 w-3.5" />
                  In Progress
                </Badge>
              )}
            </div>
          </div>

          {embedUrl && (
            <Card className="overflow-hidden">
              <div className="relative aspect-video w-full bg-neutral-950">
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </Card>
          )}

          {lesson.videoUrl && !embedUrl && (
            <Card>
              <CardContent>
                <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-4">
                  <Play className="h-5 w-5 text-accent-600" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      External Video
                    </p>
                    <a
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent-600 underline-offset-2 hover:underline"
                    >
                      Open video in new tab
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {lesson.content && (
            <Card>
              <CardContent>
                <div className="prose prose-neutral max-w-none text-sm leading-relaxed text-neutral-700">
                  {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Rich text lesson content from backend */}
                  <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {isCurrentCompleted ? (
                    <div className="flex items-center gap-2 text-sm text-accent-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">
                        You have completed this lesson
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleMarkComplete}
                      isLoading={isMarking}
                      disabled={isMarking}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Mark as Complete
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {prevLesson ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={ROUTES.STUDENT.LESSON(courseId, prevLesson.id)}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                  )}

                  {nextLesson ? (
                    <Button variant="primary" size="sm" asChild>
                      <Link
                        href={ROUTES.STUDENT.LESSON(courseId, nextLesson.id)}
                      >
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" disabled>
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="mb-3 text-sm font-semibold text-neutral-800">
                Course Outline
              </h3>
              <div className="divide-y divide-neutral-100">
                {sortedLessons.map((l, idx) => {
                  const isActive = l.id === lessonId;
                  const isComplete = completedLessonIds.has(l.id);

                  return (
                    <Link
                      key={l.id}
                      href={ROUTES.STUDENT.LESSON(courseId, l.id)}
                    >
                      <div
                        className={`flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors ${
                          isActive
                            ? "bg-accent-50 text-accent-800"
                            : "hover:bg-neutral-50"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? "text-accent-600" : "text-accent-500"
                            }`}
                          />
                        ) : (
                          <Circle
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? "text-accent-600" : "text-neutral-300"
                            }`}
                          />
                        )}
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium text-neutral-500">
                          {idx + 1}
                        </span>
                        <span
                          className={`truncate text-sm ${
                            isActive
                              ? "font-medium text-accent-800"
                              : isComplete
                                ? "text-neutral-500"
                                : "text-neutral-700"
                          }`}
                        >
                          {l.title}
                        </span>
                        {l.videoUrl && (
                          <Play className="ml-auto h-3 w-3 shrink-0 text-neutral-400" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent>
            <div className="py-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-neutral-300" />
              <p className="mt-3 text-sm font-medium text-neutral-600">
                Lesson not found
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                This lesson may have been removed or is no longer available.
              </p>
              <Button variant="primary" size="sm" className="mt-4" asChild>
                <Link href={ROUTES.STUDENT.COURSE(courseId)}>
                  Return to Course
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LessonPlayerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      <Card className="overflow-hidden">
        <Skeleton className="aspect-video w-full rounded-none" />
      </Card>

      <Card>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
