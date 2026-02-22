import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { requireUserId } from "../../common/utils/requireUser.js";
import { sendPaginated, sendSuccess } from "../../common/utils/response.js";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.getByUser(
      requireUserId(req),
      req.query.cursor as string | undefined,
    );
    sendPaginated(res, result.data, result.meta);
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const data = await notificationService.getUnreadCount(requireUserId(req));
    sendSuccess(res, data);
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAsRead(
      req.params.id as string,
      requireUserId(req),
    );
    sendSuccess(res, { message: "Marked as read" });
  }),

  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllAsRead(requireUserId(req));
    sendSuccess(res, { message: "All marked as read" });
  }),
};
