
import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const orders = await prisma.serviceOrder.findMany({
      where: {
        userId: userId,
      },
      include: {
        account: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    })

    // Simulate delivery progress for active orders
    const ordersWithProgress = orders.map(order => {
      let delivered = order.quantity
      
      if (order.status === "processing") {
        // Simulate partial delivery based on time elapsed
        const hoursElapsed = (Date.now() - order.orderDate.getTime()) / (1000 * 60 * 60)
        const progressRate = order.serviceType === "likes" ? 0.8 : 0.3 // Likes deliver faster
        delivered = Math.min(Math.floor(order.quantity * hoursElapsed * progressRate), order.quantity)
      } else if (order.status === "pending") {
        delivered = 0
      }
      
      return {
        ...order,
        delivered,
      }
    })

    return NextResponse.json({ 
      success: true, 
      orders: ordersWithProgress 
    })

  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
