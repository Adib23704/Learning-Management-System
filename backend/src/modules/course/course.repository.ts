import type { CourseStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { CourseQueryInput } from "./course.dto.js";

const courseInclude = {
  instructor: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  },
  category: { select: { id: true, name: true, slug: true } },
  _count: { select: { lessons: true, enrollments: true } },
} as const;

export const courseRepository = {
  async findMany(query: CourseQueryInput) {
    const where: Prisma.CourseWhereInput = { isDeleted: false };

    if (query.search) {
      where.title = { contains: query.search, mode: "insensitive" };
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;
    if (query.isFree !== undefined) where.isFree = query.isFree;
    if (query.instructorId) where.instructorId = query.instructorId;

    const take = query.limit + 1;
    const courses = await prisma.course.findMany({
      where,
      include: courseInclude,
      orderBy: { [query.sortBy]: query.sortOrder },
      take,
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
    });

    const hasMore = courses.length > query.limit;
    const data = hasMore ? courses.slice(0, -1) : courses;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, meta: { nextCursor, hasMore } };
  },

  async findById(id: string) {
    return prisma.course.findFirst({
      where: { id, isDeleted: false },
      include: {
        ...courseInclude,
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            isPreview: true,
            videoUrl: true,
          },
        },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.course.findFirst({
      where: { slug, isDeleted: false },
      include: {
        ...courseInclude,
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            isPreview: true,
            videoUrl: true,
          },
        },
      },
    });
  },

  async create(data: Prisma.CourseCreateInput) {
    return prisma.course.create({
      data,
      include: courseInclude,
    });
  },

  async update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
      include: courseInclude,
    });
  },

  async softDelete(id: string) {
    return prisma.course.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  },

  async updateStatus(id: string, status: CourseStatus) {
    return prisma.course.update({
      where: { id },
      data: { status },
      include: courseInclude,
    });
  },

  async updateThumbnail(id: string, thumbnailUrl: string) {
    return prisma.course.update({
      where: { id },
      data: { thumbnailUrl },
      include: courseInclude,
    });
  },

  async getEnrolledStudents(courseId: string, cursor?: string, limit = 20) {
    const take = limit + 1;
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
      take,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const hasMore = enrollments.length > limit;
    const data = hasMore ? enrollments.slice(0, -1) : enrollments;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, meta: { nextCursor, hasMore } };
  },
};
