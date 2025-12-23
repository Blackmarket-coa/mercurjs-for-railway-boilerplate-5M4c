import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { RequestQueryFields } from "@medusajs/types";

// Extend T to ensure it satisfies Medusa's RequestQueryFields
export const validateAndTransformQuery =
  <T extends RequestQueryFields & Record<string, unknown>>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.validatedQuery = validated; // now TypeScript knows it's correct
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      next(err);
    }
  };
