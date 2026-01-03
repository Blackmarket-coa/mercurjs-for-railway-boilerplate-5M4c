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
  producer: (id: string) => `producer:${id}`,
  producerByHandle: (handle: string) => `producer:handle:${handle}`,
  producerProducts: (producerId: string) => `producer:${producerId}:products`,
  orderCycle: (id: string) => `order-cycle:${id}`,
  activeOrderCycles: () => `order-cycles:active`,
  hawalaAccount: (id: string) => `hawala:account:${id}`,
  hawalaBalance: (accountId: string) => `hawala:balance:${accountId}`,
  config: (key: string) => `config:${key}`,
}

// Common TTL values (in seconds)
export const cacheTTL = {
  short: 60,        // 1 minute - for frequently changing data
  medium: 300,      // 5 minutes - default
  long: 900,        // 15 minutes - for stable data
  veryLong: 3600,   // 1 hour - for configuration
}
