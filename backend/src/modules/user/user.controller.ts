import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendPaginated, sendSuccess } from "../../common/utils/response.js";
import { userService } from "./user.service.js";

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.list(req.query as never);
    sendPaginated(res, result.data, result.meta);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getById(req.params.id as string);
    sendSuccess(res, user);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body, req.user!.role);
    sendSuccess(res, user, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.update(
      req.params.id as string,
      req.body,
      req.user!.role,
    );
    sendSuccess(res, user);
  }),

  suspend: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.suspend(
      req.params.id as string,
      req.user!.role,
    );
    sendSuccess(res, user);
  }),

  activate: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.activate(
      req.params.id as string,
      req.user!.role,
    );
    sendSuccess(res, user);
  }),
};
