/**
 * Redis Cache Service for FreeBlackMarket
 * 
 * Provides a centralized caching layer with:
 * - Automatic JSON serialization/deserialization
 * - TTL support
 * - Pattern-based invalidation
 * - Graceful fallback when Redis is unavailable
 * 
 * Usage:
 * ```typescript
 * import { cache } from "../shared/cache"
 * 
 * // Get with cache
 * const producer = await cache.getOrSet(
 *   `producer:${id}`,
 *   () => fetchProducerFromDB(id),
 *   300 // 5 minutes TTL
 * )
 * 
 * // Invalidate on update
 * await cache.invalidate(`producer:${id}`)
 * ```
 */
import { createClient, RedisClientType } from "redis"
import { createLogger } from "./logger"

const logger = createLogger("Cache")

export interface CacheOptions {
  /** Redis URL (defaults to REDIS_URL env var) */
  url?: string
  /** Key prefix for namespacing (default: "fbm:") */
  prefix?: string
  /** Default TTL in seconds (default: 300 = 5 minutes) */
  defaultTtl?: number
}

class CacheService {
  private client: RedisClientType | null = null
  private prefix: string
  private defaultTtl: number
  private connecting: Promise<void> | null = null
  private connected = false

  constructor(options: CacheOptions = {}) {
    this.prefix = options.prefix || "fbm:"
    this.defaultTtl = options.defaultTtl || 300
  }

  /**
   * Initialize Redis connection
   * Called automatically on first cache operation
   */
  async connect(): Promise<boolean> {
    const redisUrl = process.env.REDIS_URL

    if (!redisUrl) {
      logger.debug("Redis URL not configured, caching disabled")
      return false
    }

    if (this.connected) {
      return true
    }

    // Prevent multiple simultaneous connection attempts
    if (this.connecting) {
      await this.connecting
      return this.connected
    }

    this.connecting = (async () => {
      try {
        this.client = createClient({
          url: redisUrl,
          socket: {
            connectTimeout: 5000,
            reconnectStrategy: (retries) => {
              if (retries > 3) {
                logger.warn("Redis connection failed after 3 retries")
                return false
              }
              return Math.min(retries * 100, 1000)
            },
          },
        })

        this.client.on("error", (err) => {
          logger.error("Redis client error", { error: err.message })
        })

        this.client.on("reconnecting", () => {
          logger.info("Redis reconnecting...")
        })

        await this.client.connect()
        this.connected = true
        logger.info("Redis cache connected")
      } catch (error) {
        logger.warn("Failed to connect to Redis, caching disabled", {
          error: error instanceof Error ? error.message : String(error),
        })
        this.client = null
        this.connected = false
      }
    })()

    await this.connecting
    this.connecting = null
    return this.connected
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!await this.connect()) return null

    try {
      const data = await this.client!.get(this.prefix + key)
      if (!data) return null

      return JSON.parse(data) as T
    } catch (error) {
      logger.warn("Cache get failed", { key, error })
      return null
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    if (!await this.connect()) return false

    try {
      const ttl = ttlSeconds ?? this.defaultTtl
      await this.client!.setEx(this.prefix + key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      logger.warn("Cache set failed", { key, error })
      return false
    }
  }

  /**
   * Get value from cache, or fetch and cache if not present
   * This is the recommended pattern for most use cases
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch fresh data
    const data = await fetchFn()

    // Cache the result (don't await, fire and forget)
    this.set(key, data, ttlSeconds).catch(() => {
      // Errors already logged in set()
    })

    return data
  }

  /**
   * Delete a specific key from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!await this.connect()) return false

    try {
      await this.client!.del(this.prefix + key)
      return true
    } catch (error) {
      logger.warn("Cache delete failed", { key, error })
      return false
    }
  }

  /**
   * Invalidate all keys matching a pattern
   * Use with caution - KEYS command can be slow on large datasets
   * 
   * @example cache.invalidate("producer:*") // Invalidate all producer cache
   */
  async invalidate(pattern: string): Promise<number> {
    if (!await this.connect()) return 0

    try {
      const keys = await this.client!.keys(this.prefix + pattern)
      if (keys.length === 0) return 0

      const deleted = await this.client!.del(keys)
      logger.debug("Cache invalidated", { pattern, count: deleted })
      return deleted
    } catch (error) {
      logger.warn("Cache invalidate failed", { pattern, error })
      return 0
    }
  }

  /**
   * Check if Redis is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.connected || !this.client) return false

    try {
      await this.client.ping()
      return true
    } catch {
      return false
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client && this.connected) {
      await this.client.quit()
      this.connected = false
      this.client = null
      logger.info("Redis cache disconnected")
    }
  }
}

// Export singleton instance
export const cache = new CacheService()

// Export class for testing or custom instances
export { CacheService }

// Common cache key builders
export const cacheKeys = {
  // Producer cache keys
  producer: (id: string) => `producer:${id}`,
  producerByHandle: (handle: string) => `producer:handle:${handle}`,
  producerProducts: (producerId: string) => `producer:${producerId}:products`,
  producerList: (sellerId?: string) => sellerId ? `producers:seller:${sellerId}` : `producers:all`,

  // Order cycle cache keys
  orderCycle: (id: string) => `order-cycle:${id}`,
  activeOrderCycles: () => `order-cycles:active`,
  orderCycleList: (sellerId?: string) => sellerId ? `order-cycles:seller:${sellerId}` : `order-cycles:all`,

  // Hawala (financial) cache keys
  hawalaAccount: (id: string) => `hawala:account:${id}`,
  hawalaBalance: (accountId: string) => `hawala:balance:${accountId}`,

  // Admin panel cache keys
  categories: () => `categories:all`,
  category: (id: string) => `category:${id}`,
  regions: () => `regions:all`,
  region: (id: string) => `region:${id}`,
  salesChannels: () => `sales-channels:all`,

  // Vendor panel cache keys
  vendorProducts: (sellerId: string) => `vendor:${sellerId}:products`,
  vendorOrders: (sellerId: string) => `vendor:${sellerId}:orders`,
  vendorCustomers: (sellerId: string) => `vendor:${sellerId}:customers`,
  vendorStats: (sellerId: string) => `vendor:${sellerId}:stats`,
  vendorStore: (sellerId: string) => `vendor:${sellerId}:store`,

  // Store/public cache keys
  storeProducts: (limit?: number) => `store:products:${limit || 'all'}`,
  storeCategories: () => `store:categories`,
  storeCollections: () => `store:collections`,

  // Configuration cache keys
  config: (key: string) => `config:${key}`,
  featureFlags: () => `feature-flags:all`,

  // API route cache keys (for middleware)
  apiRoute: (method: string, path: string, query?: string) =>
    `api:${method}:${path}${query ? `:${query}` : ''}`,
}

// Common TTL values (in seconds)
export const cacheTTL = {
  veryShort: 10,    // 10 seconds - for real-time data
  short: 60,        // 1 minute - for frequently changing data
  medium: 300,      // 5 minutes - default
  long: 900,        // 15 minutes - for stable data
  veryLong: 3600,   // 1 hour - for configuration
  day: 86400,       // 24 hours - for static data
}

/**
 * Create a cache middleware for API routes
 * Caches GET requests based on URL and query params
 *
 * @param ttlSeconds - Time to live in seconds
 * @param keyFn - Optional function to generate custom cache key
 */
export function createCacheMiddleware(
  ttlSeconds: number = cacheTTL.medium,
  keyFn?: (req: { method: string; path: string; query: Record<string, unknown> }) => string
) {
  return async function cacheMiddleware(
    req: { method: string; path: string; query: Record<string, unknown> },
    res: {
      status: (code: number) => { json: (data: unknown) => void };
      json: (data: unknown) => void;
      setHeader: (name: string, value: string) => void;
    },
    next: () => void | Promise<void>
  ) {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // Generate cache key
    const cacheKey = keyFn
      ? keyFn(req)
      : cacheKeys.apiRoute(
          req.method,
          req.path,
          Object.keys(req.query).length > 0
            ? JSON.stringify(req.query)
            : undefined
        )

    // Try to get from cache
    const cached = await cache.get<{ data: unknown; timestamp: number }>(cacheKey)

    if (cached) {
      // Add cache headers
      res.setHeader('X-Cache', 'HIT')
      res.setHeader('X-Cache-Age', String(Math.floor((Date.now() - cached.timestamp) / 1000)))

      return res.json(cached.data)
    }

    // Store original json method to intercept response
    const originalJson = res.json.bind(res)

    res.json = function(data: unknown) {
      // Cache the response
      cache.set(cacheKey, { data, timestamp: Date.now() }, ttlSeconds).catch(() => {
        // Error already logged in cache.set
      })

      // Add cache headers
      res.setHeader('X-Cache', 'MISS')
      res.setHeader('Cache-Control', `private, max-age=${ttlSeconds}`)

      return originalJson(data)
    }

    return next()
  }
}

/**
 * Helper to invalidate cache on mutations
 * Call this after CREATE, UPDATE, DELETE operations
 */
export async function invalidateRelatedCache(patterns: string[]): Promise<void> {
  await Promise.all(patterns.map(pattern => cache.invalidate(pattern)))
}
