"use client";

import { BookOpen, Library } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate, formatPercent } from "@/lib/utils/format";
import { useGetMyEnrollmentsQuery } from "@/store/api/enrollments.api";
import type { Enrollment, EnrollmentStatus } from "@/types";

const STATUS_BADGE_MAP: Record<
  EnrollmentStatus,
  { label: string; variant: "success" | "default" | "warning" }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  COMPLETED: { label: "Completed", variant: "default" },
  DROPPED: { label: "Dropped", variant: "warning" },
};

export default function StudentCoursesPage() {
  const { data: enrollments, isLoading } = useGetMyEnrollmentsQuery();

  const grouped = useMemo(() => {
    if (!enrollments)
      return { all: [], ACTIVE: [], COMPLETED: [], DROPPED: [] };

    return {
      all: enrollments,
      ACTIVE: enrollments.filter((e) => e.status === "ACTIVE"),
      COMPLETED: enrollments.filter((e) => e.status === "COMPLETED"),
      DROPPED: enrollments.filter((e) => e.status === "DROPPED"),
    };
  }, [enrollments]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="View and manage all your enrolled courses."
        actions={
          <Button variant="primary" size="sm" asChild>
            <Link href={ROUTES.COURSES}>Browse Catalog</Link>
          </Button>
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All
            {!isLoading && <CountBadge count={grouped.all.length} />}
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            {!isLoading && <CountBadge count={grouped.ACTIVE.length} />}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {!isLoading && <CountBadge count={grouped.COMPLETED.length} />}
          </TabsTrigger>
          <TabsTrigger value="dropped">
            Dropped
            {!isLoading && <CountBadge count={grouped.DROPPED.length} />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <EnrollmentGrid
            enrollments={grouped.all}
            isLoading={isLoading}
            emptyTitle="No enrollments yet"
            emptyDescription="You haven't enrolled in any courses. Browse our catalog to get started."
          />
        </TabsContent>

        <TabsContent value="active">
          <EnrollmentGrid
            enrollments={grouped.ACTIVE}
            isLoading={isLoading}
            emptyTitle="No active courses"
            emptyDescription="You don't have any active courses right now."
          />
        </TabsContent>

        <TabsContent value="completed">
          <EnrollmentGrid
            enrollments={grouped.COMPLETED}
            isLoading={isLoading}
            emptyTitle="No completed courses"
            emptyDescription="You haven't completed any courses yet. Keep learning!"
          />
        </TabsContent>

        <TabsContent value="dropped">
          <EnrollmentGrid
            enrollments={grouped.DROPPED}
            isLoading={isLoading}
            emptyTitle="No dropped courses"
            emptyDescription="You haven't dropped any courses."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-200/80 px-1.5 text-xs font-medium text-neutral-600">
      {count}
    </span>
  );
}

function EnrollmentGrid({
  enrollments,
  isLoading,
  emptyTitle,
  emptyDescription,
}: {
  enrollments: Enrollment[];
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (isLoading) {
    return (
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <EnrollmentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <Card className="mt-4">
        <EmptyState
          icon={Library}
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button variant="primary" size="sm" asChild>
              <Link href={ROUTES.COURSES}>Browse Courses</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {enrollments.map((enrollment) => (
        <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const badgeConfig = STATUS_BADGE_MAP[enrollment.status];

  return (
    <Link href={ROUTES.STUDENT.COURSE(enrollment.courseId)}>
      <Card className="group h-full transition-shadow hover:shadow-md">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-neutral-100">
          {enrollment.course?.thumbnailUrl ? (
            <Image
              src={enrollment.course.thumbnailUrl}
              alt={enrollment.course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-accent-100 to-accent-200">
              <BookOpen className="h-10 w-10 text-accent-400" />
            </div>
          )}
          <div className="absolute right-2 top-2">
            <Badge size="sm" variant={badgeConfig.variant}>
              {badgeConfig.label}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-neutral-800 group-hover:text-accent-700">
            {enrollment.course?.title ?? "Untitled Course"}
          </h3>

          {enrollment.course?.instructor && (
            <p className="mt-1 text-xs text-neutral-500">
              {enrollment.course.instructor.firstName}{" "}
              {enrollment.course.instructor.lastName}
            </p>
          )}

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Progress</span>
              <span className="font-medium text-neutral-700">
                {formatPercent(enrollment.progress)}
              </span>
            </div>
            <Progress value={enrollment.progress} />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
            <span>Enrolled {formatDate(enrollment.enrolledAt)}</span>
            {enrollment.course?._count && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {enrollment.course._count.lessons}{" "}
                {enrollment.course._count.lessons === 1 ? "lesson" : "lessons"}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function EnrollmentCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </Card>
  );
}
