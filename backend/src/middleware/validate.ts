import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      const parsed = schemas.query.parse(req.query) as typeof req.query;
      Object.defineProperty(req, "query", {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    if (schemas.params) {
      const parsed = schemas.params.parse(req.params) as typeof req.params;
      Object.defineProperty(req, "params", {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    next();
  };
}
