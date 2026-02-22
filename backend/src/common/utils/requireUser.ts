import type { Request } from "express";
import { UnauthorizedError } from "../errors/index.js";
import type { AppRole } from "../types/express.js";

export function requireUserId(req: Request): string {
  const id = req.user?.id;
  if (!id) throw new UnauthorizedError("Authentication required");
  return id;
}

export function requireUserRole(req: Request): AppRole {
  const role = req.user?.role;
  if (!role) throw new UnauthorizedError("Authentication required");
  return role;
}
