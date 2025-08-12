import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"

// Custom error classes
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: any[]) {
    super(message, 400, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR")
    this.name = "AuthenticationError"
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR")
    this.name = "AuthorizationError"
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND_ERROR")
    this.name = "NotFoundError"
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT_ERROR")
    this.name = "ConflictError"
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_ERROR")
    this.name = "RateLimitError"
  }
}

// Error handling utility function
export function handleError(error: unknown): NextResponse {
  console.error("API Error:", error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation Error",
        code: "VALIDATION_ERROR",
        message: "Invalid input data",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      },
      { status: 400 }
    )
  }

  // Custom app errors
  if (error instanceof AppError) {
    const response: any = {
      error: error.name,
      code: error.code,
      message: error.message,
    }

    if (error instanceof ValidationError && error.errors) {
      response.details = error.errors
    }

    return NextResponse.json(response, { status: error.statusCode })
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          {
            error: "Conflict Error",
            code: "DUPLICATE_ENTRY",
            message: "A record with this information already exists",
            field: error.meta?.target,
          },
          { status: 409 }
        )

      case "P2025":
        return NextResponse.json(
          {
            error: "Not Found Error",
            code: "RECORD_NOT_FOUND",
            message: "The requested record could not be found",
          },
          { status: 404 }
        )

      case "P2003":
        return NextResponse.json(
          {
            error: "Foreign Key Error",
            code: "FOREIGN_KEY_VIOLATION",
            message: "Referenced record does not exist",
          },
          { status: 400 }
        )

      case "P2014":
        return NextResponse.json(
          {
            error: "Relation Error",
            code: "INVALID_RELATION",
            message: "The change would violate a required relation",
          },
          { status: 400 }
        )

      default:
        return NextResponse.json(
          {
            error: "Database Error",
            code: "DATABASE_ERROR",
            message: "A database error occurred",
          },
          { status: 500 }
        )
    }
  }

  // Prisma connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      {
        error: "Database Connection Error",
        code: "DATABASE_CONNECTION_ERROR",
        message: "Unable to connect to the database",
      },
      { status: 503 }
    )
  }

  // Generic errors
  if (error instanceof Error) {
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === "production" 
      ? "An internal error occurred" 
      : error.message

    return NextResponse.json(
      {
        error: "Internal Server Error",
        code: "INTERNAL_ERROR",
        message,
      },
      { status: 500 }
    )
  }

  // Unknown error
  return NextResponse.json(
    {
      error: "Unknown Error",
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
    },
    { status: 500 }
  )
}

// Async error wrapper for API routes
export function asyncHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleError(error)
    }
  }
}

// Error logging utility
export function logError(error: unknown, context?: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    error: {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    context,
  }

  if (process.env.NODE_ENV === "production") {
    // In production, you might want to send this to a logging service
    console.error(JSON.stringify(errorInfo))
  } else {
    console.error("Error Details:", errorInfo)
  }
}

// Request validation helper
export function validateRequest<T>(
  schema: any,
  data: unknown
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(
        "Invalid input data",
        error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }))
      )
    }
    throw error
  }
}