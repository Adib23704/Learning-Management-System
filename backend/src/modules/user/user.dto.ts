import { z } from "zod";

export const createUserDto = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]),
});

export const updateUserDto = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]).optional(),
});

export const userQueryDto = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT"]).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "firstName", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateUserInput = z.infer<typeof createUserDto>;
export type UpdateUserInput = z.infer<typeof updateUserDto>;
export type UserQueryInput = z.infer<typeof userQueryDto>;
