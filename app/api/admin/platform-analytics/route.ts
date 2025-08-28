import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin"

export async function GET() {
  try {
    const user = await currentUser()

    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user growth data for the last 7 days
    const userGrowthData = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // Count users created up to this date
      const usersCount = await prisma.user.count({
        where: {
          createdAt: {
            lte: new Date(dateStr + 'T23:59:59.999Z')
          }
        }
      })

      // Calculate revenue from orders created on this date
      const dailyOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(dateStr + 'T00:00:00.000Z'),
            lte: new Date(dateStr + 'T23:59:59.999Z')
          },
          status: 'COMPLETED'
        }
      })

      const dailyRevenue = dailyOrders.reduce((total, order) => total + order.amount, 0)

      userGrowthData.push({
        date: dateStr,
        users: usersCount,
        revenue: dailyRevenue / 100 // Convert cents to dollars
      })
    }

    // Get plan distribution (for now, we'll simulate this as we don't have subscription plans)
    const totalUsers = await prisma.user.count()
    const planDistribution = [
      { plan: "Free", users: Math.floor(totalUsers * 0.85), percentage: 85 },
      { plan: "Basic", users: Math.floor(totalUsers * 0.10), percentage: 10 },
      { plan: "Pro", users: Math.floor(totalUsers * 0.04), percentage: 4 },
      { plan: "Enterprise", users: Math.floor(totalUsers * 0.01), percentage: 1 },
    ]

    return NextResponse.json({
      userGrowthData,
      planDistribution
    })
  } catch (error) {
    console.error("Error fetching platform analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch platform analytics" },
      { status: 500 }
    )
  }
}