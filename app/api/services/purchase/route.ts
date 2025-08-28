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

  // Check bot availability before processing
  const { botUnavailabilityHandler } = await import("@/lib/bot-unavailability-handler")
  
  const availabilityCheck = await botUnavailabilityHandler.handleOrderRequest(
    serviceType,
    quantity,
    userId
  )

  // Handle different availability scenarios
  if (!availabilityCheck.canProceed && availabilityCheck.strategy === 'reject') {
    // Delete the order since it can't be processed
    await DatabaseTransaction.execute(async (tx) => {
      await tx.serviceOrder.delete({
        where: { id: result.id },
      })
    })

    return NextResponse.json({
      success: false,
      error: availabilityCheck.message,
      alternatives: availabilityCheck.alternatives,
      recommendedAction: availabilityCheck.recommendedAction,
      requestId,
    }, { status: 400 })
  }

  // Process order through internal system
  const { internalOrderProcessor } = await import("@/lib/internal-order-processor")

  try {
    const priority = availabilityCheck.strategy === 'full' ? 10 : 5
    await internalOrderProcessor.addToQueue(result.id, priority)

    let message = "Order placed successfully!"
    let statusInfo = {}

    switch (availabilityCheck.strategy) {
      case 'full':
        message = `Order placed successfully and will be processed immediately. ${availabilityCheck.message}`
        break
      case 'partial':
        message = `Order placed with partial immediate delivery. ${availabilityCheck.message}`
        statusInfo = { 
          partialDelivery: true,
          alternatives: availabilityCheck.alternatives 
        }
        break
      case 'queue':
        message = `Order queued successfully. ${availabilityCheck.message}`
        statusInfo = { 
          queued: true,
          alternatives: availabilityCheck.alternatives,
          estimatedTime: availabilityCheck.alternatives?.[0]?.estimatedTime
        }
        break
    }

    return NextResponse.json({
      success: true,
      orderId: result.id,
      message,
      strategy: availabilityCheck.strategy,
      ...statusInfo,
      requestId,
    })

  } catch (processingError) {
    console.error("Order processing failed:", processingError)

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
