import { z } from "zod";

export const createLessonDto = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().max(50000).optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  isPreview: z.boolean().default(false),
});

export const updateLessonDto = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(50000).nullable().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")).optional(),
  isPreview: z.boolean().optional(),
});

export const reorderLessonsDto = z.object({
  lessons: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(1),
    }),
  ),
});

export type CreateLessonInput = z.infer<typeof createLessonDto>;
export type UpdateLessonInput = z.infer<typeof updateLessonDto>;
