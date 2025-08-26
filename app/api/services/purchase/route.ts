
import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, accountId, serviceType, quantity, price, postUrl } = await request.json()

    // Validate required fields
    if (!accountId || !serviceType || !quantity || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the account belongs to the user
    const account = await prisma.instagramAccount.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
    })

    if (!account) {
      return NextResponse.json({ error: "Instagram account not found" }, { status: 404 })
    }

    // Create the service order
    const order = await prisma.serviceOrder.create({
      data: {
        userId,
        accountId,
        serviceType,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        postUrl: postUrl || null,
        status: "pending",
        orderDate: new Date(),
      },
    })

    // Import internal order processor
    const { internalOrderProcessor } = await import("@/lib/internal-order-processor")

    // Add order to internal processing queue
    try {
      await internalOrderProcessor.addToQueue(order.id, 1) // Priority 1 for new orders

      return NextResponse.json({ 
        success: true, 
        orderId: order.id,
        message: "Order placed successfully and queued for internal processing" 
      })
    } catch (processingError) {
      console.error("Order processing failed:", processingError)
      
      // Update order status to failed
      await prisma.serviceOrder.update({
        where: { id: order.id },
        data: { status: "failed" },
      })

      return NextResponse.json({ 
        success: false, 
        orderId: order.id,
        error: "Order created but processing failed. Please contact support." 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Service purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
