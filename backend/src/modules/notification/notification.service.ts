import type { NotificationType } from "@prisma/client";
import { emitToUser } from "../../socket/emitter.js";
import { notificationRepository } from "./notification.repository.js";

export const notificationService = {
  async getByUser(userId: string, cursor?: string) {
    return notificationRepository.findByUser(userId, cursor);
  },

  async getUnreadCount(userId: string) {
    const count = await notificationRepository.unreadCount(userId);
    return { count };
  },

  async create(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
  ) {
    const notification = await notificationRepository.create({
      userId,
      title,
      message,
      type,
    });

    // Push real-time notification via WebSocket
    emitToUser(userId, "notification:new", {
      id: notification.id,
      title,
      message,
      type,
    });

    return notification;
  },

  async markAsRead(id: string, userId: string) {
    await notificationRepository.markAsRead(id, userId);
  },

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
  },
};
