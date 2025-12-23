import { Request, Response, NextFunction } from "express"
import { z, ZodSchema } from "zod"
import { MedusaError } from "@medusajs/utils"

/**
 * Middleware to validate and transform request body
 * @param schema - Zod schema to validate against
 */
export const validateAndTransformBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse the body using Zod; this returns plain JS object
      const validated = schema.parse(req.body)
      req.validatedBody = validated
      next()
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          type: "validation_error",
          details: err.format(),
        })
      } else {
        next(err)
      }
    }
  }
}

/**
 * Middleware to validate and transform query params
 * @param schema - Zod schema to validate against
 * @param queryConfig - optional: Medusa QueryConfig
 */
export const validateAndTransformQuery = <T>(
  schema: ZodSchema<T>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query)
      req.validatedQuery = validated
      next()
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          type: "validation_error",
          details: err.format(),
        })
      } else {
        next(err)
      }
    }
  }
}
