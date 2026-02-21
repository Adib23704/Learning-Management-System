import { prisma } from "../../config/database.js";

export const categoryRepository = {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { courses: true } } },
    });
  },

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { courses: true } } },
    });
  },

  async findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },

  async create(data: { name: string; slug: string; description?: string }) {
    return prisma.category.create({
      data,
      include: { _count: { select: { courses: true } } },
    });
  },

  async update(
    id: string,
    data: { name?: string; slug?: string; description?: string | null },
  ) {
    return prisma.category.update({
      where: { id },
      data,
      include: { _count: { select: { courses: true } } },
    });
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },

  async countCourses(id: string) {
    return prisma.course.count({ where: { categoryId: id, isDeleted: false } });
  },
};
