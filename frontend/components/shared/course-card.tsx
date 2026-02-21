"use client";

import { BookOpen, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  showInstructor?: boolean;
  className?: string;
}

export function CourseCard({
  course,
  showInstructor = true,
  className,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card
        className={cn(
          "group overflow-hidden transition-shadow hover:shadow-md",
          className,
        )}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-accent-100 to-accent-200">
              <BookOpen className="h-10 w-10 text-accent-400" />
            </div>
          )}
          {course.category && (
            <div className="absolute left-3 top-3">
              <Badge
                size="sm"
                variant="default"
                className="bg-white/90 backdrop-blur-sm"
              >
                {course.category.name}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-neutral-800 group-hover:text-accent-700">
            {course.title}
          </h3>

          {showInstructor && course.instructor && (
            <p className="mt-1 text-xs text-neutral-500">
              {course.instructor.firstName} {course.instructor.lastName}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
            {course._count && (
              <>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {course._count.lessons}{" "}
                  {course._count.lessons === 1 ? "lesson" : "lessons"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {formatNumber(course._count.enrollments)}
                </span>
              </>
            )}
          </div>

          <div className="mt-3">
            {course.isFree ? (
              <Badge variant="success" size="sm">
                Free
              </Badge>
            ) : (
              <p className="text-sm font-bold text-neutral-800">
                {formatCurrency(course.price)}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
