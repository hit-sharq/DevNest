
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

    // Get platform analytics data
    const [
      totalUsers,
      totalCampaigns,
      activeSubscriptions,
      totalOrders,
      recentSignups,
      campaignsByStatus,
      userGrowth,
      revenueData
    ] = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.user.count({ where: { subscriptionStatus: "active" } }),
      prisma.serviceOrder.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.campaign.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.serviceOrder.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: 'completed',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ])

    const analytics = {
      overview: {
        totalUsers,
        totalCampaigns,
        activeSubscriptions,
        totalOrders,
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
