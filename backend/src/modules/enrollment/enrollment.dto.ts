import { z } from "zod";

export const enrollmentQueryDto = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.enum(["ACTIVE", "COMPLETED", "DROPPED"]).optional(),
});

export type EnrollmentQueryInput = z.infer<typeof enrollmentQueryDto>;
