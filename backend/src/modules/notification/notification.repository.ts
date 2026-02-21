import type { NotificationType } from "@prisma/client";
import { prisma } from "../../config/database.js";

export const notificationRepository = {
  async findByUser(userId: string, cursor?: string, limit = 20) {
    const take = limit + 1;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const hasMore = notifications.length > limit;
    const data = hasMore ? notifications.slice(0, -1) : notifications;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, meta: { nextCursor, hasMore } };
  },

  async unreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
  }) {
    return prisma.notification.create({ data });
  },

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
