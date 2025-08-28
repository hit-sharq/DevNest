
import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Get comprehensive analytics data
    const [userAnalytics, serviceOrders, campaigns] = await Promise.all([
      prisma.userAnalytics.findMany({
        where: {
          userId: dbUser.id,
          date: { gte: thirtyDaysAgo },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.serviceOrder.findMany({
        where: {
          userId: dbUser.id,
          orderDate: { gte: thirtyDaysAgo },
        },
        include: {
          account: true,
        },
      }),
      prisma.campaign.findMany({
        where: {
          userId: dbUser.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          actions: true,
        },
      }),
    ])

    const analytics = {
      growth: userAnalytics.map(day => ({
        date: day.date.toISOString().split('T')[0],
        followers: day.totalFollowers,
        gained: day.followersGained,
        lost: day.followersLost,
      })),
      spending: serviceOrders.reduce((acc, order) => {
        const date = order.orderDate.toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + order.price
        return acc
      }, {} as Record<string, number>),
      services: serviceOrders.reduce((acc, order) => {
        acc[order.serviceType] = (acc[order.serviceType] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        gains: campaign.totalFollowsGained,
        actions: campaign.actions.length,
      })),
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
