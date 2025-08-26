import { prisma } from "./prisma"
import { ErrorHandler, ErrorCode } from "./error-handler"

export class DatabaseTransaction {
  /**
   * Execute multiple database operations in a transaction
   */
  static async execute<T>(operations: (tx: typeof prisma) => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await prisma.$transaction(operations, {
          maxWait: 5000, // 5 seconds
          timeout: 10000, // 10 seconds
        })
      } catch (error) {
        lastError = error as Error

        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          break
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    throw new ErrorHandler.CustomError(
      ErrorCode.DATABASE_ERROR,
      `Transaction failed after ${maxRetries} attempts: ${lastError?.message}`,
      500,
      { attempts: maxRetries, lastError: lastError?.message },
    )
  }

  /**
   * Check if error should not be retried
   */
  private static shouldNotRetry(error: unknown): boolean {
    if (error instanceof Error) {
      // Don't retry validation errors, constraint violations, etc.
      const nonRetryablePatterns = [
        "Unique constraint",
        "Foreign key constraint",
        "Check constraint",
        "Invalid input",
        "Validation failed",
      ]

      return nonRetryablePatterns.some((pattern) => error.message.includes(pattern))
    }
    return false
  }

  /**
   * Safe upsert operation with conflict handling
   */
  static async safeUpsert<T>(model: any, where: any, create: any, update: any): Promise<T> {
    return this.execute(async (tx) => {
      try {
        return await tx[model].upsert({
          where,
          create,
          update,
        })
      } catch (error) {
        // Handle race conditions in upsert
        if (error instanceof Error && error.message.includes("Unique constraint")) {
          // Try to find existing record
          const existing = await tx[model].findUnique({ where })
          if (existing) {
            return await tx[model].update({
              where,
              data: update,
            })
          }
        }
        throw error
      }
    })
  }

  /**
   * Batch operations with transaction
   */
  static async batchOperations<T>(
    operations: Array<{
      model: string
      operation: "create" | "update" | "delete"
      data: any
      where?: any
    }>,
  ): Promise<T[]> {
    return this.execute(async (tx) => {
      const results: T[] = []

      for (const op of operations) {
        let result: T

        switch (op.operation) {
          case "create":
            result = await (tx as any)[op.model].create({ data: op.data })
            break
          case "update":
            result = await (tx as any)[op.model].update({
              where: op.where,
              data: op.data,
            })
            break
          case "delete":
            result = await (tx as any)[op.model].delete({ where: op.where })
            break
          default:
            throw new Error(`Unsupported operation: ${op.operation}`)
        }

        results.push(result)
      }

      return results
    })
  }
}
