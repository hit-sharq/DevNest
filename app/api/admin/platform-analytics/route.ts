
import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get basic analytics data with fallbacks
    const [
      totalUsers,
      totalCampaigns,
      activeSubscriptions,
      recentSignups
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.campaign.count().catch(() => 0),
      prisma.user.count({ where: { subscriptionStatus: "active" } }).catch(() => 0),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }).catch(() => 0)
    ])

    // Get campaign data with fallback
    const campaignsByStatus = await prisma.campaign.groupBy({
      by: ['status'],
      _count: { id: true }
    }).catch(() => [])

    // Get user growth data with fallback
    const userGrowthData = await prisma.user.findMany({
      select: {
        createdAt: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: { createdAt: 'asc' }
    }).catch(() => [])

    // Process user growth data by day
    const userGrowthByDay = userGrowthData.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const userGrowth = Object.entries(userGrowthByDay).map(([date, count]) => ({
      createdAt: new Date(date),
      _count: { id: count }
    }))

    // Mock revenue data (replace with actual revenue model when available)
    const totalRevenue = activeSubscriptions * 79 // Assuming $79/month average
    const revenueData = { _sum: { totalAmount: totalRevenue } }

    const analytics = {
      overview: {
        totalUsers,
        totalCampaigns,
        activeSubscriptions,
        totalOrders: 0, // Will be available when ServiceOrder model is added
        recentSignups,
        monthlyRevenue: revenueData._sum.totalAmount || 0
      },
      campaigns: campaignsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id
        return acc
      }, {} as Record<string, number>),
      userGrowth: userGrowth.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        users: item._count.id
      })),
      revenue: {
        total: revenueData._sum.totalAmount || 0,
        monthly: revenueData._sum.totalAmount || 0
      }
    }

    return NextResponse.json({ analytics })

  } catch (error) {
    console.error("Platform analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch platform analytics" }, 
      { status: 500 }
    )
  }
}
