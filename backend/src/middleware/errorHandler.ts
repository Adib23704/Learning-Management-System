import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../common/errors/AppError.js";
import { logger } from "../config/logger.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const requestId = req.id;

  // Known operational errors
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      requestId,
    };
    if (err.details) {
      (body.error as Record<string, unknown>).details = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details,
      },
      requestId,
    });
    return;
  }

  // Prisma known errors (check by constructor name to avoid import issues before generate)
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as Error & {
      code: string;
      meta?: { target?: string[] };
    };
    if (prismaErr.code === "P2002") {
      const target = prismaErr.meta?.target?.join(", ") ?? "field";
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: `Unique constraint violation on: ${target}`,
        },
        requestId,
      });
      return;
    }
    if (prismaErr.code === "P2025") {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Record not found" },
        requestId,
      });
      return;
    }
  }

  // JWT errors
  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: { code: "TOKEN_EXPIRED", message: "Access token has expired" },
      requestId,
    });
    return;
  }
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid access token" },
      requestId,
    });
    return;
  }

  // Unknown errors
  logger.error({ err, requestId }, "Unhandled error");
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
    requestId,
  });
}
