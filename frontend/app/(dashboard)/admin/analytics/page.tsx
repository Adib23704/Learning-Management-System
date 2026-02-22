"use client";

import { BookOpen, DollarSign, Loader2, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type Column, DataTable } from "@/components/shared/data-table";
import { StatsCard } from "@/components/shared/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/utils/format";
import {
  useGetCompletionRatesQuery,
  useGetEnrollmentGrowthQuery,
  useGetOverviewQuery,
  useGetRevenueQuery,
  useGetTopCoursesQuery,
} from "@/store/api/analytics.api";
import type { CompletionRate } from "@/types";

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading: isOverviewLoading } = useGetOverviewQuery();
  const { data: growthData, isLoading: isGrowthLoading } =
    useGetEnrollmentGrowthQuery();
  const { data: topCourses, isLoading: isTopCoursesLoading } =
    useGetTopCoursesQuery();
  const { data: revenueData, isLoading: isRevenueLoading } =
    useGetRevenueQuery();
  const { data: completionRates, isLoading: isCompletionLoading } =
    useGetCompletionRatesQuery();

  const completionColumns: Column<Record<string, unknown>>[] = useMemo(
    () => [
      {
        key: "instructor",
        header: "Instructor",
        render: (item) => {
          const cr = item as unknown as CompletionRate;
          return (
            <span className="font-medium text-neutral-800">
              {cr.firstName} {cr.lastName}
            </span>
          );
        },
      },
      {
        key: "totalEnrollments",
        header: "Enrollments",
        render: (item) => {
          const cr = item as unknown as CompletionRate;
          return (
            <span className="text-neutral-600">
              {formatNumber(cr.totalEnrollments)}
            </span>
          );
        },
      },
      {
        key: "completed",
        header: "Completed",
        render: (item) => {
          const cr = item as unknown as CompletionRate;
          return (
            <span className="text-neutral-600">
              {formatNumber(cr.completed)}
            </span>
          );
        },
      },
      {
        key: "completionRate",
        header: "Rate",
        render: (item) => {
          const cr = item as unknown as CompletionRate;
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-accent-600"
                  style={{ width: `${Math.min(cr.completionRate, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-neutral-700">
                {formatPercent(cr.completionRate)}
              </span>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Analytics</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Detailed platform performance metrics and insights.
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
            />
            <StatsCard
              title="Total Students"
              value={formatNumber(stats?.totalStudents ?? 0)}
              icon={Users}
            />
            <StatsCard
              title="Total Enrollments"
              value={formatNumber(stats?.totalEnrollments ?? 0)}
              icon={TrendingUp}
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats?.totalRevenue ?? 0)}
              icon={DollarSign}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Growth</CardTitle>
          <CardDescription>Daily new enrollments over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isGrowthLoading ? (
            <div className="flex h-80 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : !growthData || growthData.length === 0 ? (
            <div className="flex h-80 items-center justify-center text-sm text-neutral-400">
              No enrollment data available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient
                    id="analyticsEnrollmentGrad"
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
                  fill="url(#analyticsEnrollmentGrad)"
                  name="Enrollments"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Course</CardTitle>
            <CardDescription>Top revenue-generating courses</CardDescription>
          </CardHeader>
          <CardContent>
            {isRevenueLoading ? (
              <div className="flex h-80 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
              </div>
            ) : !revenueData || revenueData.length === 0 ? (
              <div className="flex h-80 items-center justify-center text-sm text-neutral-400">
                No revenue data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={revenueData.slice(0, 8)}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-neutral-200)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "var(--color-neutral-500)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fontSize: 11, fill: "var(--color-neutral-600)" }}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Revenue",
                    ]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid var(--color-neutral-200)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Bar
                    dataKey="totalRevenue"
                    fill="var(--color-accent-600)"
                    radius={[0, 4, 4, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Courses by Enrollment</CardTitle>
            <CardDescription>
              Most popular courses on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isTopCoursesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`tc-skel-${i}`} className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : !topCourses || topCourses.length === 0 ? (
              <div className="flex h-80 items-center justify-center text-sm text-neutral-400">
                No course data available yet.
              </div>
            ) : (
              <div className="space-y-3">
                {topCourses.map((course, index) => {
                  const maxCount = topCourses[0]?.enrollmentCount || 1;
                  const width = (course.enrollmentCount / maxCount) * 100;
                  return (
                    <div key={course.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium text-neutral-700">
                          {index + 1}. {course.title}
                        </span>
                        <span className="ml-2 shrink-0 text-neutral-500">
                          {formatNumber(course.enrollmentCount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-accent-600 transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Rates by Instructor</CardTitle>
          <CardDescription>
            Course completion performance per instructor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={completionColumns}
            data={
              (completionRates as unknown as Record<string, unknown>[]) ?? []
            }
            isLoading={isCompletionLoading}
            emptyMessage="No completion data available yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}
