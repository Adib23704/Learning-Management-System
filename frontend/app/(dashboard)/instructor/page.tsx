"use client";

import { BookOpen, DollarSign, GraduationCap, Plus, Users } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { StatsCard } from "@/components/shared/stats-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/format";
import { useGetInstructorOverviewQuery } from "@/store/api/analytics.api";
import { useGetCoursesQuery } from "@/store/api/courses.api";

export default function InstructorDashboard() {
  const { user } = useCurrentUser();
  const { data: overview, isLoading: overviewLoading } =
    useGetInstructorOverviewQuery();
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesQuery({
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const courses = coursesData?.data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your courses and track student progress.
          </p>
        </div>
        <Button asChild>
          <Link href={ROUTES.INSTRUCTOR.NEW_COURSE}>
            <Plus className="h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {overviewLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Courses"
            value={formatNumber(overview?.courseCount ?? 0)}
            icon={BookOpen}
            description="Courses you've created"
          />
          <StatsCard
            title="Total Students"
            value={formatNumber(overview?.totalStudents ?? 0)}
            icon={Users}
            description="Enrolled across all courses"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(overview?.totalRevenue ?? 0)}
            icon={DollarSign}
            description="Lifetime earnings"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Courses</CardTitle>
            <Button variant="link" asChild>
              <Link href={ROUTES.INSTRUCTOR.COURSES}>View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No courses yet"
              description="Create your first course to get started teaching."
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
            <div className="divide-y divide-neutral-100">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={ROUTES.INSTRUCTOR.EDIT_COURSE(course.id)}
                  className="flex items-center gap-4 py-3 transition-colors hover:bg-neutral-50 -mx-5 px-5 first:pt-0 last:pb-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">
                      {course.title}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatDate(course.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-neutral-500 sm:inline">
                      {course._count?.enrollments ?? 0} students
                    </span>
                    <StatusBadge status={course.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
