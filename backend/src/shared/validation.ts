import { z } from "zod"

/**
 * Common validation schemas and utilities
 * 
 * Centralized validation to ensure consistency across API endpoints
 */

// ===========================================
// EMAIL VALIDATION
// ===========================================

/**
 * Email regex pattern - RFC 5322 simplified
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Strict email regex - more comprehensive validation
 */
export const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * Normalize email (lowercase and trim)
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// ===========================================
// ZOD SCHEMAS
// ===========================================

/**
 * Email schema with normalization
 */
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .transform(normalizeEmail)

/**
 * Password schema with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")

/**
 * Strong password schema with complexity requirements
 */
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .refine(
    (val) => /[A-Z]/.test(val),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (val) => /[a-z]/.test(val),
    "Password must contain at least one lowercase letter"
  )
  .refine(
    (val) => /[0-9]/.test(val),
    "Password must contain at least one number"
  )

/**
 * ID schema - validates string IDs
 */
export const idSchema = z.string().min(1).max(100)

/**
 * UUID schema
 */
export const uuidSchema = z.string().uuid()

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

/**
 * Money amount schema (in cents)
 */
export const amountSchema = z
  .number()
  .int("Amount must be a whole number (cents)")
  .min(0, "Amount must be positive")
  .max(100_000_000_00, "Amount exceeds maximum") // $100M max

/**
 * Currency code schema
 */
export const currencySchema = z
  .string()
  .length(3)
  .toUpperCase()

/**
 * Phone number schema (E.164 format)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format (use E.164 format: +1234567890)")

/**
 * URL schema
 */
export const urlSchema = z.string().url()

/**
 * Handle/slug schema
 */
export const handleSchema = z
  .string()
  .min(3, "Handle must be at least 3 characters")
  .max(50, "Handle must be less than 50 characters")
  .regex(/^[a-z0-9-]+$/, "Handle can only contain lowercase letters, numbers, and hyphens")

/**
 * Date string schema (ISO 8601)
 */
export const dateStringSchema = z.string().datetime()

/**
 * Optional date schema that accepts string or Date
 */
export const dateSchema = z.union([
  z.string().datetime(),
  z.date(),
]).transform((val) => new Date(val))

// ===========================================
// SANITIZATION UTILITIES
// ===========================================

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim()
}

/**
 * Sanitize filename (prevent path traversal)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, "") // Remove parent directory references
    .replace(/[/\\]/g, "") // Remove path separators
    .replace(/[<>:"|?*]/g, "") // Remove invalid filename chars
    .trim()
}

/**
 * Validate and sanitize filename
 */
export function isValidFilename(filename: string): boolean {
  return (
    filename.length > 0 &&
    filename.length < 256 &&
    !filename.includes("..") &&
    !filename.includes("/") &&
    !filename.includes("\\")
  )
}
