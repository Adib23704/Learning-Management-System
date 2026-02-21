import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/response.js";
import { analyticsService } from "./analytics.service.js";

export const analyticsController = {
  getOverview: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getOverview();
    sendSuccess(res, data);
  }),

  getEnrollmentGrowth: asyncHandler(async (req: Request, res: Response) => {
    const days = Number(req.query.days) || 10;
    const data = await analyticsService.getEnrollmentGrowth(days);
    sendSuccess(res, data);
  }),

  getTopCourses: asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 5;
    const data = await analyticsService.getTopCourses(limit);
    sendSuccess(res, data);
  }),

  getRevenueByCourse: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getRevenueByCourse();
    sendSuccess(res, data);
  }),

  getCompletionRates: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.getCompletionRates();
    sendSuccess(res, data);
  }),

  getInstructorOverview: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getInstructorOverview(req.user!.id);
    sendSuccess(res, data);
  }),

  getInstructorRevenue: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getInstructorRevenue(req.user!.id);
    sendSuccess(res, data);
  }),
};
