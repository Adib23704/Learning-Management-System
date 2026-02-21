import { z } from "zod";

export const createCategoryDto = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export const updateCategoryDto = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategoryDto>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryDto>;
