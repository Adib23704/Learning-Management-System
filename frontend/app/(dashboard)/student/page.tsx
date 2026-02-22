"use client";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Library,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatsCard } from "@/components/shared/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ROUTES } from "@/lib/constants/routes";
import { formatPercent } from "@/lib/utils/format";
import { useGetMyEnrollmentsQuery } from "@/store/api/enrollments.api";
import type { Enrollment } from "@/types";

export default function StudentDashboard() {
  const { user } = useCurrentUser();
  const { data: enrollments, isLoading } = useGetMyEnrollmentsQuery();

  const stats = useMemo(() => {
    if (!enrollments) return { enrolled: 0, completed: 0, avgProgress: 0 };

    const enrolled = enrollments.filter((e) => e.status === "ACTIVE").length;
    const completed = enrollments.filter(
      (e) => e.status === "COMPLETED",
    ).length;
    const activeEnrollments = enrollments.filter((e) => e.status === "ACTIVE");
    const avgProgress =
      activeEnrollments.length > 0
        ? activeEnrollments.reduce((sum, e) => sum + e.progress, 0) /
          activeEnrollments.length
        : 0;

    return { enrolled, completed, avgProgress };
  }, [enrollments]);

  const recentActive = useMemo(() => {
    if (!enrollments) return [];
    return enrollments
      .filter((e) => e.status === "ACTIVE")
      .sort(
        (a, b) =>
          new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime(),
      )
      .slice(0, 4);
  }, [enrollments]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">
          Welcome back, {user?.firstName}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Here&apos;s an overview of your learning progress.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Enrolled Courses"
              value={stats.enrolled}
              description="Currently active courses"
              icon={BookOpen}
            />
            <StatsCard
              title="Completed"
              value={stats.completed}
              description="Courses finished"
              icon={GraduationCap}
            />
            <StatsCard
              title="Average Progress"
              value={formatPercent(stats.avgProgress)}
              description="Across active courses"
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800">
            In Progress
          </h2>
          {recentActive.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.STUDENT.COURSES}>
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <EnrollmentCardSkeleton key={i} />
            ))}
          </div>
        ) : recentActive.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentActive.map((enrollment) => (
              <EnrollmentProgressCard
                key={enrollment.id}
                enrollment={enrollment}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <EmptyState
                icon={Library}
                title="No courses in progress"
                description="Browse our catalog and enroll in a course to start learning."
                action={
                  <Button variant="primary" size="sm" asChild>
                    <Link href={ROUTES.COURSES}>Browse Courses</Link>
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function EnrollmentProgressCard({ enrollment }: { enrollment: Enrollment }) {
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
              <BookOpen className="h-8 w-8 text-accent-400" />
            </div>
          )}
          <div className="absolute right-2 top-2">
            <Badge
              size="sm"
              variant="default"
              className="bg-white/90 backdrop-blur-sm"
            >
              {formatPercent(enrollment.progress)}
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
        </div>
      </Card>
    </Link>
  );
}

function StatsCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </Card>
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
      </div>
    </Card>
  );
}
