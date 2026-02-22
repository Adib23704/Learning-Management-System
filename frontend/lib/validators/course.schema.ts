import { z } from "zod";

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be under 150 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description is too long")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().min(1, "Please select a category"),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(9999, "Price seems too high"),
  isFree: z.boolean(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const lessonSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title is too long"),
  content: z
    .string()
    .max(50000, "Content is too long")
    .optional()
    .or(z.literal("")),
  videoUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  isPreview: z.boolean(),
});

export type LessonInput = z.infer<typeof lessonSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  description: z
    .string()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;
