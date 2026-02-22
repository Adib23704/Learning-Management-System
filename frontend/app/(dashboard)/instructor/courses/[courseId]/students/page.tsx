"use client";

import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { type Column, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate, formatPercent } from "@/lib/utils/format";
import {
  useGetCourseQuery,
  useGetCourseStudentsQuery,
} from "@/store/api/courses.api";

interface StudentRow {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  progress: number;
  enrolledAt: string;
  status: string;
}

export default function CourseStudentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data: course } = useGetCourseQuery(courseId);
  const { data: studentsData, isLoading } = useGetCourseStudentsQuery({
    courseId,
  });

  const enrollments =
    studentsData?.data ?? (studentsData as unknown as unknown[]) ?? [];
  const students: StudentRow[] = (enrollments as Record<string, unknown>[]).map(
    (enrollment) => {
      const student = enrollment.student as
        | { firstName?: string; lastName?: string; email?: string }
        | undefined;
      return {
        id: enrollment.id as string,
        name: student
          ? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()
          : "Unknown Student",
        email: student?.email ?? "-",
        progress: (enrollment.progress as number) ?? 0,
        enrolledAt: enrollment.enrolledAt as string,
        status: (enrollment.status as string) ?? "ACTIVE",
      };
    },
  );

  const columns: Column<StudentRow>[] = [
    {
      key: "name",
      header: "Student",
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-neutral-800">{row.name}</p>
          <p className="text-xs text-neutral-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Progress value={row.progress} className="h-2 w-20" />
          <span className="text-xs font-medium text-neutral-600">
            {formatPercent(row.progress)}
          </span>
        </div>
      ),
    },
    {
      key: "enrolledAt",
      header: "Enrolled",
      render: (row) => (
        <span className="text-sm text-neutral-600">
          {formatDate(row.enrolledAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} type="enrollment" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={course ? `Students: ${course.title}` : "Course Students"}
        description="View enrolled students and their progress."
        actions={
          <Button variant="outline" asChild>
            <Link href={ROUTES.INSTRUCTOR.EDIT_COURSE(courseId)}>
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Link>
          </Button>
        }
      />

      {!isLoading && students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students enrolled"
          description="Students will appear here once they enroll in your course."
        />
      ) : (
        <DataTable
          columns={columns}
          data={students}
          isLoading={isLoading}
          emptyMessage="No students enrolled in this course yet."
        />
      )}
    </div>
  );
}
