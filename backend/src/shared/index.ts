/**
 * Shared Utilities for FreeBlackMarket.com Backend
 * 
 * This module provides centralized, reusable utilities for:
 * - Rate limiting
 * - Authentication helpers
 * - Error handling
 * - Logging
 * - Validation
 * - Type definitions
 * 
 * @example
 * ```typescript
 * import { 
 *   authRateLimiter,
 *   extractSellerId,
 *   handleApiError,
 *   logger,
 *   emailSchema,
 *   DeliveryStatus 
 * } from "../shared"
 * ```
 */

// Rate Limiting
export {
  createRateLimiter,
  standardRateLimiter,
  authRateLimiter,
  strictAuthRateLimiter,
  uploadRateLimiter,
  type RateLimiterOptions,
} from "./rate-limiter"

// Authentication Helpers
export {
  extractSellerId,
  extractCustomerId,
  extractDriverId,
  extractAdminId,
  requireSellerId,
  requireCustomerId,
} from "./auth-helpers"

// Error Handling
export {
  handleApiError,
  notFound,
  forbidden,
  validationError,
  conflict,
  ErrorTypes,
} from "./error-handler"

// Logging
export {
  logger,
  createLogger,
  loggers,
} from "./logger"

// Validation
export {
  // Email
  EMAIL_REGEX,
  isValidEmail,
  normalizeEmail,
  emailSchema,
  // Password
  passwordSchema,
  strongPasswordSchema,
  // IDs
  idSchema,
  uuidSchema,
  // Pagination
  paginationSchema,
  // Money
  amountSchema,
  currencySchema,
  // Other
  phoneSchema,
  urlSchema,
  handleSchema,
  dateStringSchema,
  dateSchema,
  // Sanitization
  sanitizeString,
  sanitizeFilename,
  isValidFilename,
} from "./validation"

// Types
export {
  // Badge & Impact
  BuyerBadgeType,
  type BadgeRequirements,
  type BuyerBadgeDefinition,
  type OrderImpactData,
  type ProducerBreakdownItem,
  // Delivery
  type DeliveryStatus,
  type StatusHistoryEntry,
  type GeoJSONGeometry,
  type ServiceHours,
  type DeliveryZone,
  // Subscription
  type SubscriptionInterval,
  type SubscriptionType,
  type SubscriptionStatus,
  type Subscription,
  // Product
  type VariantOption,
  type VariantPrice,
  type ProductVariant,
  // Ticket
  type TicketProduct,
  type TicketPurchase,
  // File
  type UploadedFile,
  type MediaFileResult,
  // Financial
  type PayoutConfig,
  type PayoutSplitRule,
  // API
  type PaginatedResponse,
  type ApiError,
  // Utility
  type DeepPartial,
  type ArrayElement,
  type WithRequired,
} from "./types"
