import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../common/errors/index.js";
import type { AppRole } from "../common/types/express.js";
import { verifyAccessToken } from "../common/utils/token.js";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing access token");
  }

  const token = header.split(" ")[1];
  const payload = verifyAccessToken(token);
  req.user = { id: payload.sub, role: payload.role as AppRole };
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const token = header.split(" ")[1];
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role as AppRole };
    }
  } catch {
    // continue without auth
  }
  next();
}
