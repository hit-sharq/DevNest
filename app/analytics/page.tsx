
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { AnalyticsOverview } from "@/components/analytics/analytics-overview"
import { RevenueAnalytics } from "@/components/analytics/revenue-analytics"
import { UserGrowthChart } from "@/components/analytics/user-growth-chart"
import { ServicePerformance } from "@/components/analytics/service-performance"
import { CampaignAnalytics } from "@/components/analytics/campaign-analytics"

export default async function AnalyticsPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      instagramAccounts: true,
      campaigns: {
        include: {
          actions: true,
          account: true,
        },
      },
      serviceOrders: {
        include: {
          account: true,
        },
      },
    },
  })

  if (!dbUser) {
    redirect("/dashboard")
  }

  // Get analytics data from database
  const analyticsData = await getAnalyticsData(dbUser.id)

  return (
    <div className="min-h-screen bg-background">
      <AnalyticsHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your Instagram growth</p>
        </div>

        <AnalyticsOverview data={analyticsData.overview} />

        <div className="grid lg:grid-cols-2 gap-8">
          <UserGrowthChart data={analyticsData.userGrowth} />
          <RevenueAnalytics data={analyticsData.revenue} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <ServicePerformance data={analyticsData.services} />
          <CampaignAnalytics campaigns={dbUser.campaigns} />
        </div>
      </main>
    </div>
  )
}

async function getAnalyticsData(userId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get user's analytics
  const userAnalytics = await prisma.userAnalytics.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: 'asc' },
  })

  // Get service orders analytics
  const serviceOrders = await prisma.serviceOrder.findMany({
    where: {
      userId,
      orderDate: { gte: thirtyDaysAgo },
    },
  })

  // Get campaign analytics
  const campaigns = await prisma.campaign.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
    },
    include: {
      actions: true,
    },
  })

  // Calculate overview metrics
  const totalSpent = serviceOrders.reduce((sum, order) => sum + order.price, 0)
  const totalOrders = serviceOrders.length
  const activeServices = serviceOrders.filter(order => 
    ['pending', 'processing'].includes(order.status)
  ).length
  const recentGrowth = userAnalytics.slice(-7).reduce((sum, day) => 
    sum + day.followersGained, 0
  )

  return {
    overview: {
      totalSpent,
      totalOrders,
      activeServices,
      recentGrowth,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    },
    userGrowth: userAnalytics.map(day => ({
      date: day.date.toISOString().split('T')[0],
      followers: day.totalFollowers,
      gained: day.followersGained,
      lost: day.followersLost,
    })),
    revenue: {
      daily: calculateDailySpending(serviceOrders),
      total: totalSpent,
      average: totalOrders > 0 ? totalSpent / totalOrders : 0,
    },
    services: calculateServiceMetrics(serviceOrders),
  }
}

function calculateDailySpending(orders: any[]) {
  const dailySpending: Record<string, number> = {}
  
  orders.forEach(order => {
    const date = order.orderDate.toISOString().split('T')[0]
    dailySpending[date] = (dailySpending[date] || 0) + order.price
  })

  return Object.entries(dailySpending).map(([date, amount]) => ({
    date,
    amount,
  }))
}

function calculateServiceMetrics(orders: any[]) {
  const serviceTypes = ['followers', 'likes', 'comments', 'views', 'story_views']
  
  return serviceTypes.map(type => {
    const typeOrders = orders.filter(order => order.serviceType === type)
    const totalSpent = typeOrders.reduce((sum, order) => sum + order.price, 0)
    const totalQuantity = typeOrders.reduce((sum, order) => sum + order.quantity, 0)
    const delivered = typeOrders.reduce((sum, order) => sum + order.delivered, 0)
    const completionRate = totalQuantity > 0 ? (delivered / totalQuantity) * 100 : 0
    
    return {
      type,
      orders: typeOrders.length,
      spent: totalSpent,
      quantity: totalQuantity,
      delivered,
      completionRate,
    }
  })
}
