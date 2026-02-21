import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { EnrollmentQueryInput } from "./enrollment.dto.js";

const enrollmentInclude = {
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      instructor: {
        select: { id: true, firstName: true, lastName: true },
      },
      _count: { select: { lessons: true } },
    },
  },
} as const;

export const enrollmentRepository = {
  async findByStudentId(studentId: string, query: EnrollmentQueryInput) {
    const where: Prisma.EnrollmentWhereInput = { studentId };
    if (query.status) where.status = query.status;

    const take = query.limit + 1;
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: enrollmentInclude,
      orderBy: { enrolledAt: "desc" },
      take,
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
    });

    const hasMore = enrollments.length > query.limit;
    const data = hasMore ? enrollments.slice(0, -1) : enrollments;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, meta: { nextCursor, hasMore } };
  },

  async findByStudentAndCourse(studentId: string, courseId: string) {
    return prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
      include: {
        ...enrollmentInclude,
        lessonProgress: {
          include: {
            lesson: { select: { id: true, title: true, order: true } },
          },
          orderBy: { lesson: { order: "asc" } },
        },
      },
    });
  },

  async create(studentId: string, courseId: string) {
    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: { studentId, courseId },
        include: enrollmentInclude,
      });

      const lessons = await tx.lesson.findMany({
        where: { courseId },
        select: { id: true },
      });

      if (lessons.length > 0) {
        await tx.lessonProgress.createMany({
          data: lessons.map((lesson) => ({
            enrollmentId: enrollment.id,
            lessonId: lesson.id,
          })),
        });
      }

      return enrollment;
    });
  },

  async drop(enrollmentId: string) {
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "DROPPED", droppedAt: new Date() },
      include: enrollmentInclude,
    });
  },

  async markLessonComplete(enrollmentId: string, lessonId: string) {
    return prisma.lessonProgress.update({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      data: { isCompleted: true, completedAt: new Date() },
    });
  },

  async recalculateProgress(enrollmentId: string) {
    const total = await prisma.lessonProgress.count({
      where: { enrollmentId },
    });
    const completed = await prisma.lessonProgress.count({
      where: { enrollmentId, isCompleted: true },
    });

    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    const isComplete = progress === 100;

    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        ...(isComplete && {
          status: "COMPLETED",
          completedAt: new Date(),
        }),
      },
    });
  },

  async getProgress(enrollmentId: string) {
    return prisma.lessonProgress.findMany({
      where: { enrollmentId },
      include: { lesson: { select: { id: true, title: true, order: true } } },
      orderBy: { lesson: { order: "asc" } },
    });
  },
};
