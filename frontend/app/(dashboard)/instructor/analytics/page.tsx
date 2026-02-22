"use client";

import { BarChart3, BookOpen, DollarSign, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import {
  useGetInstructorOverviewQuery,
  useGetInstructorRevenueQuery,
} from "@/store/api/analytics.api";
import type { RevenueItem } from "@/types";

export default function InstructorAnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } =
    useGetInstructorOverviewQuery();
  const { data: revenueData, isLoading: revenueLoading } =
    useGetInstructorRevenueQuery();

  const revenueItems: RevenueItem[] = revenueData ?? [];
  const maxRevenue = Math.max(
    ...revenueItems.map((item) => item.totalRevenue),
    1,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Track your teaching performance and revenue."
      />

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
            title="Total Revenue"
            value={formatCurrency(overview?.totalRevenue ?? 0)}
            icon={DollarSign}
            description="Lifetime earnings"
          />
          <StatsCard
            title="Total Students"
            value={formatNumber(overview?.totalStudents ?? 0)}
            icon={Users}
            description="Enrolled across all courses"
          />
          <StatsCard
            title="Total Courses"
            value={formatNumber(overview?.courseCount ?? 0)}
            icon={BookOpen}
            description="Courses you've created"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Course</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : revenueItems.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No revenue data"
              description="Revenue will appear here once students start enrolling in your paid courses."
            />
          ) : (
            <div className="space-y-5">
              {revenueItems.map((item) => {
                const widthPercent = (item.totalRevenue / maxRevenue) * 100;

                return (
                  <div key={item.courseId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="truncate text-sm font-medium text-neutral-800">
                          {item.title}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {formatNumber(item.enrollmentCount)} students &middot;{" "}
                          {formatCurrency(item.price)} per enrollment
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-neutral-800">
                        {formatCurrency(item.totalRevenue)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-accent-500 transition-all duration-500"
                        style={{ width: `${Math.max(widthPercent, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {!revenueLoading && revenueItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Course
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Price
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Students
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {revenueItems.map((item) => (
                    <tr key={item.courseId}>
                      <td className="py-3 text-neutral-800">{item.title}</td>
                      <td className="py-3 text-right text-neutral-600">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 text-right text-neutral-600">
                        {formatNumber(item.enrollmentCount)}
                      </td>
                      <td className="py-3 text-right font-medium text-neutral-800">
                        {formatCurrency(item.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-neutral-200">
                    <td className="pt-3 font-medium text-neutral-800">Total</td>
                    <td className="pt-3" />
                    <td className="pt-3 text-right font-medium text-neutral-600">
                      {formatNumber(
                        revenueItems.reduce(
                          (sum, item) => sum + item.enrollmentCount,
                          0,
                        ),
                      )}
                    </td>
                    <td className="pt-3 text-right font-semibold text-neutral-800">
                      {formatCurrency(
                        revenueItems.reduce(
                          (sum, item) => sum + item.totalRevenue,
                          0,
                        ),
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
