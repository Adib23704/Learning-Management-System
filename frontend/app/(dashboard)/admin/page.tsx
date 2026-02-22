"use client";

import {
  BookOpen,
  DollarSign,
  Loader2,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatsCard } from "@/components/shared/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import {
  useGetEnrollmentGrowthQuery,
  useGetOverviewQuery,
  useGetTopCoursesQuery,
} from "@/store/api/analytics.api";
import type { PopularCourse } from "@/types";

export default function AdminDashboard() {
  const { user } = useCurrentUser();

  const { data: stats, isLoading: isOverviewLoading } = useGetOverviewQuery();
  const { data: growthData, isLoading: isGrowthLoading } =
    useGetEnrollmentGrowthQuery();
  const { data: topCoursesData, isLoading: isTopCoursesLoading } =
    useGetTopCoursesQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Welcome back, {user?.firstName}. Here is an overview of your platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isOverviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={`stat-skeleton-${i}`} className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Courses"
              value={formatNumber(stats?.totalCourses ?? 0)}
              icon={BookOpen}
              description="Published and draft courses"
            />
            <StatsCard
              title="Total Students"
              value={formatNumber(stats?.totalStudents ?? 0)}
              icon={Users}
              description="Registered students"
            />
            <StatsCard
              title="Total Enrollments"
              value={formatNumber(stats?.totalEnrollments ?? 0)}
              icon={TrendingUp}
              description="Across all courses"
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats?.totalRevenue ?? 0)}
              icon={DollarSign}
              description="Lifetime earnings"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Enrollment Growth</CardTitle>
            <CardDescription>
              New enrollments over the last 10 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGrowthLoading ? (
              <div className="flex h-75 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
              </div>
            ) : !growthData || growthData.length === 0 ? (
              <div className="flex h-75 items-center justify-center text-sm text-neutral-400">
                No enrollment data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient
                      id="enrollmentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-accent-600)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-accent-600)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-neutral-200)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "var(--color-neutral-500)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--color-neutral-500)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid var(--color-neutral-200)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-accent-600)"
                    strokeWidth={2}
                    fill="url(#enrollmentGradient)"
                    name="Enrollments"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Courses</CardTitle>
            <CardDescription>By enrollment count</CardDescription>
          </CardHeader>
          <CardContent>
            {isTopCoursesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`top-skeleton-${i}`}
                    className="flex items-center gap-3"
                  >
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !topCoursesData || topCoursesData.length === 0 ? (
              <div className="flex h-60 items-center justify-center text-sm text-neutral-400">
                No courses yet.
              </div>
            ) : (
              <div className="space-y-4">
                {topCoursesData
                  .slice(0, 5)
                  .map((course: PopularCourse, index: number) => (
                    <div key={course.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent-50 text-sm font-semibold text-accent-700">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-800">
                          {course.title}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatNumber(course.enrollmentCount)} enrollments
                        </p>
                      </div>
                      <Trophy className="h-4 w-4 shrink-0 text-neutral-300" />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
