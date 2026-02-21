import { prisma } from "../../config/database.js";

export const lessonRepository = {
  async findByCourse(courseId: string) {
    return prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.lesson.findUnique({
      where: { id },
    });
  },

  async getNextOrder(courseId: string) {
    const last = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    return (last?.order ?? 0) + 1;
  },

  async create(data: {
    title: string;
    content?: string;
    videoUrl?: string;
    isPreview: boolean;
    order: number;
    courseId: string;
  }) {
    return prisma.lesson.create({ data });
  },

  async update(
    id: string,
    data: Partial<{
      title: string;
      content: string | null;
      videoUrl: string | null;
      isPreview: boolean;
    }>,
  ) {
    return prisma.lesson.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.lesson.delete({ where: { id } });
  },

  async reorder(_courseId: string, items: { id: string; order: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.lesson.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );
  },

  async countByCourse(courseId: string) {
    return prisma.lesson.count({ where: { courseId } });
  },
};
