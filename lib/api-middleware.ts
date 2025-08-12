// Comprehensive API middleware system
import { NextRequest, NextResponse } from "next/server"
import { handleError, asyncHandler } from "./errors"
import { logger } from "./logger"
import { Cache } from "./cache"
import { generalRateLimit, authRateLimit, strictRateLimit } from "./rate-limit"
import { requireUser, getSecurityHeaders } from "./auth-utils"
import { requirePermission, Permission } from "./rbac"
import { User } from "@prisma/client"

// Request context interface
export interface RequestContext {
  user?: User
  requestId: string
  startTime: number
  ip: string
  userAgent: string
}

// Middleware options
export interface MiddlewareOptions {
  auth?: boolean | 'required' | 'optional'
  rateLimit?: 'general' | 'auth' | 'strict' | 'none'
  permission?: Permission
  cache?: {
    key?: string
    ttl?: number
  }
  validation?: any // Zod schema
  logging?: boolean
}

// Enhanced request wrapper with context
export function withMiddleware(
  handler: (req: NextRequest, context: RequestContext) => Promise<NextResponse>,
  options: MiddlewareOptions = {}
) {
  return asyncHandler(async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    const requestId = crypto.randomUUID()
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Create request context
    const context: RequestContext = {
      requestId,
      startTime,
      ip,
      userAgent,
    }

    // Log request if logging is enabled (default: true)
    if (options.logging !== false) {
      logger.request(
        req.method,
        new URL(req.url).pathname,
        undefined,
        requestId,
        { ip, userAgent }
      )
    }

    try {
      // Apply rate limiting
      if (options.rateLimit && options.rateLimit !== 'none') {
        switch (options.rateLimit) {
          case 'general':
            await generalRateLimit(req)
            break
          case 'auth':
            await authRateLimit(req)
            break
          case 'strict':
            await strictRateLimit(req)
            break
        }
      }

      // Handle authentication
      if (options.auth === 'required' || options.auth === true) {
        context.user = await requireUser(req)
      } else if (options.auth === 'optional') {
        try {
          const { getUserFromRequest } = await import('./auth-utils')
          context.user = await getUserFromRequest(req)
        } catch {
          // Optional auth - ignore errors
        }
      }

      // Check permissions
      if (options.permission && context.user) {
        requirePermission(options.permission)(context.user)
      }

      // Handle caching for GET requests
      if (req.method === 'GET' && options.cache?.key) {
        const cachedResponse = Cache.get<any>(options.cache.key)
        if (cachedResponse) {
          logger.debug('Returning cached response', { cacheKey: options.cache.key })
          return NextResponse.json(cachedResponse, {
            headers: getSecurityHeaders(),
          })
        }
      }

      // Validate request body for non-GET requests
      if (options.validation && req.method !== 'GET') {
        try {
          const body = await req.json()
          const validatedData = options.validation.parse(body)
          // Attach validated data to request (Next.js doesn't have a standard way)
          ;(req as any).validatedData = validatedData
        } catch (error) {
          return handleError(error)
        }
      }

      // Execute the handler
      const response = await handler(req, context)

      // Cache successful GET responses
      if (
        req.method === 'GET' && 
        options.cache?.key && 
        response.status === 200
      ) {
        try {
          const responseData = await response.clone().json()
          Cache.set(
            options.cache.key,
            responseData,
            options.cache.ttl || 1800
          )
        } catch {
          // Ignore caching errors for non-JSON responses
        }
      }

      // Add security headers
      const securityHeaders = getSecurityHeaders()
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      // Log response
      if (options.logging !== false) {
        const duration = Date.now() - startTime
        logger.response(
          req.method,
          new URL(req.url).pathname,
          response.status,
          duration,
          context.user?.id,
          requestId
        )
      }

      return response
    } catch (error) {
      // Log error response
      if (options.logging !== false) {
        const duration = Date.now() - startTime
        logger.response(
          req.method,
          new URL(req.url).pathname,
          500,
          duration,
          context.user?.id,
          requestId
        )
      }
      
      throw error
    }
  })
}

// Predefined middleware combinations
export const Middleware = {
  // Public endpoints (no auth, general rate limiting)
  public: (options: Omit<MiddlewareOptions, 'auth' | 'rateLimit'> = {}) =>
    (handler: (req: NextRequest, context: RequestContext) => Promise<NextResponse>) =>
      withMiddleware(handler, {
        ...options,
        auth: false,
        rateLimit: 'general',
      }),

  // Protected endpoints (auth required, general rate limiting)
  protected: (options: Omit<MiddlewareOptions, 'auth' | 'rateLimit'> = {}) =>
    (handler: (req: NextRequest, context: RequestContext) => Promise<NextResponse>) =>
      withMiddleware(handler, {
        ...options,
        auth: 'required',
        rateLimit: 'general',
      }),

  // Admin endpoints (admin permission required, strict rate limiting)
  admin: (options: Omit<MiddlewareOptions, 'auth' | 'rateLimit' | 'permission'> = {}) =>
    (handler: (req: NextRequest, context: RequestContext) => Promise<NextResponse>) =>
      withMiddleware(handler, {
        ...options,
        auth: 'required',
        rateLimit: 'strict',
        permission: Permission.MANAGE_SYSTEM,
      }),

  // Auth endpoints (special rate limiting for login/register)
  auth: (options: Omit<MiddlewareOptions, 'rateLimit'> = {}) =>
    (handler: (req: NextRequest, context: RequestContext) => Promise<NextResponse>) =>
      withMiddleware(handler, {
        ...options,
        rateLimit: 'auth',
      }),

  // Cached endpoints (with caching enabled)
  cached: (
    cacheKey: string,
    ttl: number = 1800,
    options: Omit<MiddlewareOptions, 'cache'> = {}
  ) =>
    (handler: (req: NextRequest, context: RequestContext) => Promise<NextResponse>) =>
      withMiddleware(handler, {
        ...options,
        cache: { key: cacheKey, ttl },
      }),
}

// Helper function to create custom middleware
export function createMiddleware(options: MiddlewareOptions) {
  return (handler: (req: NextRequest, context: RequestContext) => Promise<NextResponse>) =>
    withMiddleware(handler, options)
}

// Permission-based middleware helpers
export const RequirePermission = {
  manageUsers: createMiddleware({
    auth: 'required',
    permission: Permission.MANAGE_USERS,
    rateLimit: 'strict',
  }),

  manageFoods: createMiddleware({
    auth: 'required',
    permission: Permission.MANAGE_FOODS,
    rateLimit: 'general',
  }),

  createFoods: createMiddleware({
    auth: 'required',
    permission: Permission.CREATE_FOODS,
    rateLimit: 'general',
  }),

  verifyFoods: createMiddleware({
    auth: 'required',
    permission: Permission.VERIFY_FOODS,
    rateLimit: 'general',
  }),

  importData: createMiddleware({
    auth: 'required',
    permission: Permission.IMPORT_DATA,
    rateLimit: 'strict',
  }),

  exportData: createMiddleware({
    auth: 'required',
    permission: Permission.EXPORT_DATA,
    rateLimit: 'general',
  }),

  viewAnalytics: createMiddleware({
    auth: 'required',
    permission: Permission.VIEW_ANALYTICS,
    rateLimit: 'general',
  }),
}

// CORS middleware for API routes
export function withCORS(
  handler: (req: NextRequest) => Promise<NextResponse>,
  origins: string[] = ['http://localhost:3000', 'https://your-domain.com']
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const origin = req.headers.get('origin')
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin && origins.includes(origin) ? origin : origins[0],
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const response = await handler(req)

    if (origin && origins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }

    return response
  }
}

// Request validation helper
export function validateBody<T>(schema: any) {
  return async (req: NextRequest): Promise<T> => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      throw new Error('Cannot validate body for GET or DELETE requests')
    }

    try {
      const body = await req.json()
      return schema.parse(body)
    } catch (error) {
      throw error
    }
  }
}

// Query parameters validation
export function validateQuery<T>(schema: any, url: URL): T {
  try {
    const params = Object.fromEntries(url.searchParams)
    return schema.parse(params)
  } catch (error) {
    throw error
  }
}

// Health check endpoint helper
export function createHealthCheck(
  checks: Record<string, () => Promise<boolean>>
) {
  return async (): Promise<NextResponse> => {
    const results: Record<string, boolean> = {}
    let allHealthy = true

    for (const [name, check] of Object.entries(checks)) {
      try {
        results[name] = await check()
        if (!results[name]) {
          allHealthy = false
        }
      } catch (error) {
        results[name] = false
        allHealthy = false
      }
    }

    return NextResponse.json(
      {
        status: allHealthy ? 'healthy' : 'unhealthy',
        checks: results,
        timestamp: new Date().toISOString(),
      },
      { status: allHealthy ? 200 : 503 }
    )
  }
}

// Request timeout middleware
export function withTimeout(
  handler: (req: NextRequest) => Promise<NextResponse>,
  timeoutMs: number = 30000
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await Promise.race([
        handler(req),
        new Promise<NextResponse>((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Request timeout'))
          })
        })
      ])

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.message === 'Request timeout') {
        return NextResponse.json(
          { error: 'Request timeout', message: 'Request took too long to process' },
          { status: 408 }
        )
      }
      throw error
    }
  }
}