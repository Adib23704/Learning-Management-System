import type { Response } from "express";

export function sendSuccess(
  res: Response,
  data: unknown,
  statusCode = 200,
  meta?: Record<string, unknown>,
) {
  const body: Record<string, unknown> = { success: true, data };
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
}

export function sendPaginated(
  res: Response,
  data: unknown[],
  meta: { nextCursor: string | null; hasMore: boolean },
) {
  res.status(200).json({ success: true, data, meta });
}
