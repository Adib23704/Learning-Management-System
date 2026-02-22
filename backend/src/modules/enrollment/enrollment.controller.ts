import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { requireUserId } from "../../common/utils/requireUser.js";
import { sendPaginated, sendSuccess } from "../../common/utils/response.js";
import { enrollmentService } from "./enrollment.service.js";

export const enrollmentController = {
  getMyEnrollments: asyncHandler(async (req: Request, res: Response) => {
    const result = await enrollmentService.getMyEnrollments(
      requireUserId(req),
      req.query as never,
    );
    sendPaginated(res, result.data, result.meta);
  }),

  getEnrollmentDetail: asyncHandler(async (req: Request, res: Response) => {
    const enrollment = await enrollmentService.getEnrollmentDetail(
      requireUserId(req),
      req.params.courseId as string,
    );
    sendSuccess(res, enrollment);
  }),

  enroll: asyncHandler(async (req: Request, res: Response) => {
    const enrollment = await enrollmentService.enroll(
      requireUserId(req),
      req.params.courseId as string,
    );
    sendSuccess(res, enrollment, 201);
  }),

  drop: asyncHandler(async (req: Request, res: Response) => {
    const enrollment = await enrollmentService.drop(
      requireUserId(req),
      req.params.courseId as string,
    );
    sendSuccess(res, enrollment);
  }),

  markLessonComplete: asyncHandler(async (req: Request, res: Response) => {
    const result = await enrollmentService.markLessonComplete(
      requireUserId(req),
      req.params.courseId as string,
      req.params.lessonId as string,
    );
    sendSuccess(res, result);
  }),

  getProgress: asyncHandler(async (req: Request, res: Response) => {
    const result = await enrollmentService.getProgress(
      requireUserId(req),
      req.params.courseId as string,
    );
    sendSuccess(res, result);
  }),
};
