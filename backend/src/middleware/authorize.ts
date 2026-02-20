import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../common/errors/index.js";
import type { AppRole } from "../common/types/express.js";

export function authorize(...allowedRoles: AppRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
    next();
  };
}
