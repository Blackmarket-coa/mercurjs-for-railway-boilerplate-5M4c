import type { MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { logger } from "./logger"

/**
 * Standard error response structure
 */
interface ErrorResponse {
  message: string
  type: string
  code?: string
  details?: unknown
}

/**
 * Error types for consistent API responses
 */
export const ErrorTypes = {
  NOT_FOUND: "not_found",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  INVALID_DATA: "invalid_data",
  CONFLICT: "conflict",
  INTERNAL_ERROR: "internal_error",
  RATE_LIMIT: "rate_limit_exceeded",
  VALIDATION_ERROR: "validation_error",
} as const

/**
 * Handle API errors consistently
 * 
 * @example
 * ```typescript
 * try {
 *   // ... operation
 * } catch (error) {
 *   return handleApiError(res, error, "fetching product")
 * }
 * ```
 */
export function handleApiError(
  res: MedusaResponse,
  error: unknown,
  operation: string
): void {
  // Log the error with context
  logger.error(`Error ${operation}:`, error)

  // Handle MedusaError specifically
  if (error instanceof MedusaError) {
    const statusMap: Record<string, number> = {
      [MedusaError.Types.NOT_FOUND]: 404,
      [MedusaError.Types.INVALID_DATA]: 400,
      [MedusaError.Types.UNAUTHORIZED]: 401,
      [MedusaError.Types.NOT_ALLOWED]: 403,
      [MedusaError.Types.DUPLICATE_ERROR]: 409,
    }

    const status = statusMap[error.type] || 500
    
    res.status(status).json({
      message: error.message,
      type: error.type,
      code: error.code,
    } as ErrorResponse)
    return
  }

  // Handle standard Error
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes("not found")) {
      res.status(404).json({
        message: error.message,
        type: ErrorTypes.NOT_FOUND,
      } as ErrorResponse)
      return
    }

    if (error.message.includes("unauthorized") || error.message.includes("authentication")) {
      res.status(401).json({
        message: error.message,
        type: ErrorTypes.UNAUTHORIZED,
      } as ErrorResponse)
      return
    }

    // Default to internal error
    res.status(500).json({
      message: `Failed ${operation}`,
      type: ErrorTypes.INTERNAL_ERROR,
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    } as ErrorResponse)
    return
  }

  // Handle unknown error types
  res.status(500).json({
    message: `An unexpected error occurred while ${operation}`,
    type: ErrorTypes.INTERNAL_ERROR,
  } as ErrorResponse)
}

/**
 * Send a not found response
 */
export function notFound(res: MedusaResponse, resource: string, id?: string): void {
  const message = id 
    ? `${resource} with ID "${id}" not found`
    : `${resource} not found`
  
  res.status(404).json({
    message,
    type: ErrorTypes.NOT_FOUND,
  } as ErrorResponse)
}

/**
 * Send a forbidden response
 */
export function forbidden(res: MedusaResponse, message = "Access denied"): void {
  res.status(403).json({
    message,
    type: ErrorTypes.FORBIDDEN,
  } as ErrorResponse)
}

/**
 * Send a validation error response
 */
export function validationError(
  res: MedusaResponse, 
  message: string, 
  details?: unknown
): void {
  res.status(400).json({
    message,
    type: ErrorTypes.VALIDATION_ERROR,
    details,
  } as ErrorResponse)
}

/**
 * Send a conflict error response
 */
export function conflict(res: MedusaResponse, message: string): void {
  res.status(409).json({
    message,
    type: ErrorTypes.CONFLICT,
  } as ErrorResponse)
}
