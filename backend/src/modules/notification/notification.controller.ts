import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendPaginated, sendSuccess } from "../../common/utils/response.js";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.getByUser(
      req.user!.id,
      req.query.cursor as string | undefined,
    );
    sendPaginated(res, result.data, result.meta);
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const data = await notificationService.getUnreadCount(req.user!.id);
    sendSuccess(res, data);
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAsRead(req.params.id as string, req.user!.id);
    sendSuccess(res, { message: "Marked as read" });
  }),

  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllAsRead(req.user!.id);
    sendSuccess(res, { message: "All marked as read" });
  }),
};
