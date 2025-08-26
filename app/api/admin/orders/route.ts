import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const provider = searchParams.get("provider")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {}
    if (status) where.status = status
    if (provider) where.providerId = provider

    const orders = await prisma.serviceOrder.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        account: {
          select: {
            username: true
          }
        }
      },
      orderBy: { orderDate: "desc" },
      take: limit,
      skip: offset
    })

    const totalOrders = await prisma.serviceOrder.count({ where })

    // Get order statistics
    const stats = await prisma.serviceOrder.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      orders,
      pagination: {
        total: totalOrders,
        limit,
        offset,
        hasMore: offset + limit < totalOrders
      },
      stats: statusStats
    })

  } catch (error) {
    console.error("Admin orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, orderIds } = await request.json()

    switch (action) {
      case "retry":
        const { orderProcessor } = await import("@/lib/order-processor")
        for (const orderId of orderIds) {
          await orderProcessor.addToQueue(orderId)
        }
        return NextResponse.json({ success: true, message: "Orders added to retry queue" })

      case "cancel":
        await prisma.serviceOrder.updateMany({
          where: { id: { in: orderIds } },
          data: { status: "failed" }
        })
        return NextResponse.json({ success: true, message: "Orders cancelled" })

      case "update_status":
        const { orderProcessor: processor } = await import("@/lib/order-processor")
        for (const orderId of orderIds) {
          await processor.updateOrderStatus(orderId)
        }
        return NextResponse.json({ success: true, message: "Order statuses updated" })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Admin order action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
