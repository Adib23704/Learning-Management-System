import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = crypto.randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}
