import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { servicePurchaseSchema, validateRequest } from "@/lib/validation"
import { ErrorHandler, generateRequestId, withErrorHandler } from "@/lib/error-handler"
import { DatabaseTransaction } from "@/lib/database-transactions"

async function purchaseServiceHandler(request: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId()

  // Require authentication
  const user = await AuthService.requireAuth()

  const requestData = await request.json()
  const validation = validateRequest(servicePurchaseSchema, requestData)

  if (!validation.success) {
    throw ErrorHandler.validationError("Invalid request data", validation.error, requestId)
  }

  const { userId, accountId, serviceType, quantity, price, postUrl } = validation.data

  // Verify user ID matches authenticated user
  if (userId !== user.id) {
    throw ErrorHandler.forbidden("Unauthorized access to user data", requestId)
  }

  // Verify account ownership
  const ownsAccount = await AuthService.verifyResourceOwnership("instagramAccount", accountId, user.id)
  if (!ownsAccount) {
    throw ErrorHandler.notFound("Instagram account", requestId)
  }

  // Create order and process in transaction
  const result = await DatabaseTransaction.execute(async (tx) => {
    // Create the service order
    const order = await tx.serviceOrder.create({
      data: {
        userId,
        accountId,
        serviceType,
        quantity,
        price,
        postUrl: postUrl || null,
        status: "pending",
        orderDate: new Date(),
      },
    })

    // Update user's order count for analytics
    await tx.user.update({
      where: { id: userId },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: price },
      },
    })

    return order
  })

  // Import internal order processor
  const { internalOrderProcessor } = await import("@/lib/internal-order-processor")

  // Add order to internal processing queue
  try {
    await internalOrderProcessor.addToQueue(result.id, 1) // Priority 1 for new orders

    return NextResponse.json({
      success: true,
      orderId: result.id,
      message: "Order placed successfully and queued for internal processing",
      requestId,
    })
  } catch (processingError) {
    console.error("Order processing failed:", processingError)

    // Update order status to failed in transaction
    await DatabaseTransaction.execute(async (tx) => {
      await tx.serviceOrder.update({
        where: { id: result.id },
        data: { status: "failed" },
      })
    })

    throw ErrorHandler.serviceUnavailable("Order created but processing failed. Please contact support.", requestId)
  }
}

export const POST = withErrorHandler(purchaseServiceHandler)
