
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

    // Here you would integrate with your payment processor
    // For now, we'll simulate a successful payment
    
    // Update order status to processing
    await prisma.serviceOrder.update({
      where: { id: order.id },
      data: { status: "processing" },
    })

    // In a real implementation, you would:
    // 1. Process payment through Stripe/PayPal
    // 2. Queue the service delivery
    // 3. Update delivery status
    // 4. Send confirmation emails

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: "Order placed successfully" 
    })

  } catch (error) {
    console.error("Service purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
