import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_TOKEN = "INVALID_TOKEN",
  ACCOUNT_INACTIVE = "ACCOUNT_INACTIVE",

  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Resource Management
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
  RESOURCE_CONFLICT = "RESOURCE_CONFLICT",

  // Business Logic
  INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  PAYMENT_FAILED = "PAYMENT_FAILED",

  // System Errors
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
}

export interface AppError {
  code: ErrorCode
  message: string
  statusCode: number
  details?: any
  stack?: string
  timestamp: Date
  requestId?: string
}

export class CustomError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: any
  public readonly timestamp: Date
  public readonly requestId?: string

  constructor(code: ErrorCode, message: string, statusCode = 500, details?: any, requestId?: string) {
    super(message)
    this.name = "CustomError"
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date()
    this.requestId = requestId

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, CustomError)
  }
}

export class ErrorHandler {
  private static isDevelopment = process.env.NODE_ENV === "development"

  /**
   * Handle and format errors for API responses
   */
  static handleError(error: unknown, requestId?: string): NextResponse {
    const appError = this.normalizeError(error, requestId)

    // Log error for monitoring
    this.logError(appError)

    // Return sanitized error response
    return this.createErrorResponse(appError)
  }

  /**
   * Normalize different error types into AppError format
   */
  private static normalizeError(error: unknown, requestId?: string): AppError {
    const timestamp = new Date()

    // Handle custom application errors
    if (error instanceof CustomError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        stack: this.isDevelopment ? error.stack : undefined,
        timestamp,
        requestId,
      }
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }))

      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: "Validation failed",
        statusCode: 400,
        details,
        timestamp,
        requestId,
      }
    }

    // Handle Prisma database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(error, timestamp, requestId)
    }

    // Handle generic Prisma errors
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return {
        code: ErrorCode.DATABASE_ERROR,
        message: "Database operation failed",
        statusCode: 500,
        details: this.isDevelopment ? { originalError: error.message } : undefined,
        timestamp,
        requestId,
      }
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      // Check for specific error messages to categorize
      if (error.message.includes("Authentication required")) {
        return {
          code: ErrorCode.UNAUTHORIZED,
          message: "Authentication required",
          statusCode: 401,
          timestamp,
          requestId,
        }
      }

      if (error.message.includes("privileges required")) {
        return {
          code: ErrorCode.FORBIDDEN,
          message: "Insufficient permissions",
          statusCode: 403,
          timestamp,
          requestId,
        }
      }

      return {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: this.isDevelopment ? error.message : "Internal server error",
        statusCode: 500,
        stack: this.isDevelopment ? error.stack : undefined,
        timestamp,
        requestId,
      }
    }

    // Handle unknown error types
    return {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
      statusCode: 500,
      details: this.isDevelopment ? { originalError: String(error) } : undefined,
      timestamp,
      requestId,
    }
  }

  /**
   * Handle Prisma-specific errors
   */
  private static handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
    timestamp: Date,
    requestId?: string,
  ): AppError {
    switch (error.code) {
      case "P2002": // Unique constraint violation
        return {
          code: ErrorCode.RESOURCE_ALREADY_EXISTS,
          message: "Resource already exists",
          statusCode: 409,
          details: this.isDevelopment ? { field: error.meta?.target } : undefined,
          timestamp,
          requestId,
        }

      case "P2025": // Record not found
        return {
          code: ErrorCode.RESOURCE_NOT_FOUND,
          message: "Resource not found",
          statusCode: 404,
          timestamp,
          requestId,
        }

      case "P2003": // Foreign key constraint violation
        return {
          code: ErrorCode.RESOURCE_CONFLICT,
          message: "Resource conflict",
          statusCode: 409,
          details: this.isDevelopment ? { field: error.meta?.field_name } : undefined,
          timestamp,
          requestId,
        }

      case "P2034": // Transaction failed
        return {
          code: ErrorCode.DATABASE_ERROR,
          message: "Transaction failed",
          statusCode: 500,
          timestamp,
          requestId,
        }

      default:
        return {
          code: ErrorCode.DATABASE_ERROR,
          message: "Database operation failed",
          statusCode: 500,
          details: this.isDevelopment ? { prismaCode: error.code, meta: error.meta } : undefined,
          timestamp,
          requestId,
        }
    }
  }

  /**
   * Create standardized error response
   */
  private static createErrorResponse(appError: AppError): NextResponse {
    const response = {
      error: {
        code: appError.code,
        message: appError.message,
        timestamp: appError.timestamp.toISOString(),
        ...(appError.requestId && { requestId: appError.requestId }),
        ...(appError.details && { details: appError.details }),
        ...(appError.stack && { stack: appError.stack }),
      },
    }

    return NextResponse.json(response, { status: appError.statusCode })
  }

  /**
   * Log errors for monitoring and debugging
   */
  private static logError(appError: AppError): void {
    const logLevel = appError.statusCode >= 500 ? "error" : "warn"
    const logData = {
      level: logLevel,
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      timestamp: appError.timestamp.toISOString(),
      requestId: appError.requestId,
      details: appError.details,
      stack: appError.stack,
    }

    if (logLevel === "error") {
      console.error("[ERROR]", JSON.stringify(logData, null, 2))
    } else {
      console.warn("[WARN]", JSON.stringify(logData, null, 2))
    }

    // In production, you would send this to your monitoring service
    // Examples: Sentry, DataDog, New Relic, etc.
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoringService(appError)
    }
  }

  /**
   * Send error to external monitoring service
   */
  private static sendToMonitoringService(appError: AppError): void {
    // Example integration with monitoring services
    // This would be replaced with actual service integration

    try {
      // Example: Sentry integration
      // Sentry.captureException(appError)

      // Example: Custom webhook
      // fetch(process.env.ERROR_WEBHOOK_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(appError)
      // })

      console.log("[MONITORING] Error sent to monitoring service:", appError.code)
    } catch (monitoringError) {
      console.error("[MONITORING] Failed to send error to monitoring service:", monitoringError)
    }
  }

  /**
   * Create specific error types for common scenarios
   */
  static unauthorized(message = "Authentication required", requestId?: string): CustomError {
    return new CustomError(ErrorCode.UNAUTHORIZED, message, 401, undefined, requestId)
  }

  static forbidden(message = "Insufficient permissions", requestId?: string): CustomError {
    return new CustomError(ErrorCode.FORBIDDEN, message, 403, undefined, requestId)
  }

  static notFound(resource = "Resource", requestId?: string): CustomError {
    return new CustomError(ErrorCode.RESOURCE_NOT_FOUND, `${resource} not found`, 404, undefined, requestId)
  }

  static validationError(message: string, details?: any, requestId?: string): CustomError {
    return new CustomError(ErrorCode.VALIDATION_ERROR, message, 400, details, requestId)
  }

  static rateLimitExceeded(message = "Rate limit exceeded", requestId?: string): CustomError {
    return new CustomError(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, undefined, requestId)
  }

  static serviceUnavailable(message = "Service temporarily unavailable", requestId?: string): CustomError {
    return new CustomError(ErrorCode.SERVICE_UNAVAILABLE, message, 503, undefined, requestId)
  }

  static paymentFailed(message = "Payment processing failed", details?: any, requestId?: string): CustomError {
    return new CustomError(ErrorCode.PAYMENT_FAILED, message, 402, details, requestId)
  }
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
): (...args: T) => Promise<R | NextResponse> {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return ErrorHandler.handleError(error)
    }
  }
}

/**
 * Generate unique request ID for error tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
