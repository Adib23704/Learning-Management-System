import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendPaginated, sendSuccess } from "../../common/utils/response.js";
import { courseService } from "./course.service.js";

export const courseController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await courseService.list(req.query as never);
    sendPaginated(res, result.data, result.meta);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.getById(req.params.id as string);
    sendSuccess(res, course);
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.getBySlug(req.params.slug as string);
    sendSuccess(res, course);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.create(req.body, req.user!.id);
    sendSuccess(res, course, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.update(
      req.params.id as string,
      req.body,
      req.user!.id,
      req.user!.role,
    );
    sendSuccess(res, course);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await courseService.delete(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
    );
    sendSuccess(res, { message: "Course deleted" });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.updateStatus(
      req.params.id as string,
      req.body.status,
      req.user!.id,
      req.user!.role,
    );
    sendSuccess(res, course);
  }),

  uploadThumbnail: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.uploadThumbnail(
      req.params.id as string,
      req.file!,
      req.user!.id,
      req.user!.role,
    );
    sendSuccess(res, course);
  }),

  getEnrolledStudents: asyncHandler(async (req: Request, res: Response) => {
    const result = await courseService.getEnrolledStudents(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      req.query.cursor as string | undefined,
    );
    sendPaginated(res, result.data, result.meta);
  }),
};
