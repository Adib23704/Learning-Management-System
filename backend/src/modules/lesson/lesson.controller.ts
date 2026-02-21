import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/response.js";
import { lessonService } from "./lesson.service.js";

export const lessonController = {
  listByCourse: asyncHandler(async (req: Request, res: Response) => {
    const lessons = await lessonService.listByCourse(
      req.params.courseId as string,
    );
    sendSuccess(res, lessons);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const lesson = await lessonService.getById(req.params.lessonId as string);
    sendSuccess(res, lesson);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const lesson = await lessonService.create(
      req.params.courseId as string,
      req.body,
      req.user!.id,
      req.user!.role,
    );
    sendSuccess(res, lesson, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const lesson = await lessonService.update(
      req.params.lessonId as string,
      req.body,
      req.user!.id,
      req.user!.role,
    );
    sendSuccess(res, lesson);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await lessonService.delete(
      req.params.lessonId as string,
      req.user!.id,
      req.user!.role,
    );
    sendSuccess(res, { message: "Lesson deleted" });
  }),

  reorder: asyncHandler(async (req: Request, res: Response) => {
    await lessonService.reorder(
      req.params.courseId as string,
      req.body.lessons,
      req.user!.id,
      req.user!.role,
    );
    sendSuccess(res, { message: "Lessons reordered" });
  }),
};
