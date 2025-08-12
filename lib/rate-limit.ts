import { NextRequest } from "next/server"
import { RateLimitError } from "./errors"
import { logger } from "./logger"

interface RateLimitOptions {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
  onLimitReached?: (req: NextRequest, identifier: string) => void
}

interface RequestRecord {
  count: number
  resetTime: number
  firstRequestTime: number
}

// In-memory store for rate limiting (use Redis in production for distributed systems)
class MemoryStore {
  private store = new Map<string, RequestRecord>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, record] of this.store.entries()) {
      if (record.resetTime < now) {
        this.store.delete(key)
      }
    }
  }

  increment(key: string, windowMs: number): RequestRecord {
    const now = Date.now()
    const existing = this.store.get(key)

    if (!existing || existing.resetTime < now) {
      // Create new window
      const record: RequestRecord = {
        count: 1,
        resetTime: now + windowMs,
        firstRequestTime: now,
      }
      this.store.set(key, record)
      return record
    } else {
      // Increment existing window
      existing.count++
      this.store.set(key, existing)
      return existing
    }
  }

  get(key: string): RequestRecord | undefined {
    const record = this.store.get(key)
    if (record && record.resetTime >= Date.now()) {
      return record
    }
    return undefined
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

// Global store instance
const store = new MemoryStore()

// Default key generator - uses IP address
function defaultKeyGenerator(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }

  // Fallback to a default value (should not happen in production)
  return 'unknown-ip'
}

// User-based key generator for authenticated requests
export function userKeyGenerator(userId: string): (req: NextRequest) => string {
  return (req: NextRequest) => `user:${userId}`
}

// Endpoint-specific key generator
export function endpointKeyGenerator(endpoint: string): (req: NextRequest) => string {
  return (req: NextRequest) => {
    const ip = defaultKeyGenerator(req)
    return `${ip}:${endpoint}`
  }
}

// Create rate limiter function
export function createRateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = defaultKeyGenerator,
    onLimitReached,
  } = options

  return async function rateLimit(req: NextRequest): Promise<void> {
    const identifier = keyGenerator(req)
    const record = store.increment(identifier, windowMs)

    if (record.count > maxRequests) {
      // Rate limit exceeded
      if (onLimitReached) {
        onLimitReached(req, identifier)
      }

      logger.security('Rate limit exceeded', undefined, {
        identifier,
        count: record.count,
        maxRequests,
        windowMs,
        endpoint: req.url,
      })

      throw new RateLimitError(`Too many requests. Limit: ${maxRequests} per ${windowMs}ms`)
    }

    // Log rate limit info (debug level)
    logger.debug('Rate limit check passed', {
      identifier,
      count: record.count,
      maxRequests,
      remaining: maxRequests - record.count,
    })
  }
}

// Pre-configured rate limiters for different use cases

// General API rate limiter - 100 requests per 15 minutes
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
})

// Authentication rate limiter - 5 attempts per 15 minutes
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyGenerator: endpointKeyGenerator('auth'),
})

// Strict rate limiter for sensitive operations - 10 per hour
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
})

// File upload rate limiter - 20 per hour
export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20,
})

// Search rate limiter - 200 per 15 minutes (more lenient for search)
export const searchRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 200,
})

// User-specific rate limiter factory
export function createUserRateLimit(userId: string, maxRequests: number = 200, windowMs: number = 15 * 60 * 1000) {
  return createRateLimit({
    windowMs,
    maxRequests,
    keyGenerator: userKeyGenerator(userId),
  })
}

// Rate limit headers helper
export function getRateLimitHeaders(identifier: string, maxRequests: number): HeadersInit {
  const record = store.get(identifier)
  
  if (!record) {
    return {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': maxRequests.toString(),
      'X-RateLimit-Reset': new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }
  }

  const remaining = Math.max(0, maxRequests - record.count)
  const resetTime = new Date(record.resetTime).toISOString()

  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime,
  }
}

// Cleanup function for graceful shutdown
export function cleanup() {
  store.destroy()
}

// Rate limit middleware wrapper for API routes
export function withRateLimit(
  rateLimitFunction: (req: NextRequest) => Promise<void>
) {
  return async function middleware(req: NextRequest): Promise<void> {
    await rateLimitFunction(req)
  }
}

// IP whitelist for bypassing rate limits (for admin operations, monitoring, etc.)
const IP_WHITELIST = new Set(
  process.env.RATE_LIMIT_WHITELIST?.split(',').map(ip => ip.trim()) || []
)

export function isWhitelisted(req: NextRequest): boolean {
  const ip = defaultKeyGenerator(req)
  return IP_WHITELIST.has(ip)
}

// Enhanced rate limiter that considers IP whitelist
export function createSmartRateLimit(options: RateLimitOptions) {
  const rateLimitFn = createRateLimit(options)
  
  return async function smartRateLimit(req: NextRequest): Promise<void> {
    if (isWhitelisted(req)) {
      logger.debug('Request bypassed rate limit (whitelisted IP)')
      return
    }
    
    await rateLimitFn(req)
  }
}