import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/response.js";
import { categoryService } from "./category.service.js";

export const categoryController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.list();
    sendSuccess(res, categories);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const cat = await categoryService.getById(req.params.id as string);
    sendSuccess(res, cat);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const cat = await categoryService.create(req.body);
    sendSuccess(res, cat, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const cat = await categoryService.update(req.params.id as string, req.body);
    sendSuccess(res, cat);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await categoryService.delete(req.params.id as string);
    sendSuccess(res, { message: "Category deleted" });
  }),
};
