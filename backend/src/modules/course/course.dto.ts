import { z } from "zod";

export const createCourseDto = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  price: z.coerce.number().min(0).default(0),
  isFree: z.boolean().default(true),
  categoryId: z.string().optional(),
});

export const updateCourseDto = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  price: z.coerce.number().min(0).optional(),
  isFree: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
});

export const courseStatusDto = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const courseQueryDto = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(12),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  isFree: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  instructorId: z.string().optional(),
  sortBy: z.enum(["createdAt", "title", "price"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCourseInput = z.infer<typeof createCourseDto>;
export type UpdateCourseInput = z.infer<typeof updateCourseDto>;
export type CourseQueryInput = z.infer<typeof courseQueryDto>;
