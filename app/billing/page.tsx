
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BillingHeader } from "@/components/billing/billing-header"
import { CurrentPlan } from "@/components/billing/current-plan"
import { BillingHistory } from "@/components/billing/billing-history"
import { UsageAnalytics } from "@/components/billing/usage-analytics"
import { PaymentMethods } from "@/components/billing/payment-methods"
import { SpendingInsights } from "@/components/billing/spending-insights"

export default async function BillingPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      serviceOrders: {
        orderBy: { orderDate: 'desc' },
        include: {
          account: true,
        },
      },
    },
  })

  if (!dbUser) {
    redirect("/dashboard")
  }

  // Get billing analytics
  const billingData = await getBillingData(dbUser.id)

  return (
    <div className="min-h-screen bg-background">
      <BillingHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription, payments, and usage</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CurrentPlan user={dbUser} />
            <UsageAnalytics data={billingData.usage} />
            <BillingHistory orders={dbUser.serviceOrders} />
          </div>
          
          <div className="space-y-8">
            <SpendingInsights data={billingData.insights} />
            <PaymentMethods />
          </div>
        </div>
      </main>
    </div>
  )
}

async function getBillingData(userId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get recent orders for usage analytics
  const recentOrders = await prisma.serviceOrder.findMany({
    where: {
      userId,
      orderDate: { gte: thirtyDaysAgo },
    },
    orderBy: { orderDate: 'desc' },
  })

  // Calculate usage metrics
  const totalSpent = recentOrders.reduce((sum, order) => sum + order.price, 0)
  const ordersByService = recentOrders.reduce((acc, order) => {
    acc[order.serviceType] = (acc[order.serviceType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const spendingByService = recentOrders.reduce((acc, order) => {
    acc[order.serviceType] = (acc[order.serviceType] || 0) + order.price
    return acc
  }, {} as Record<string, number>)

  // Calculate daily spending for trend
  const dailySpending = recentOrders.reduce((acc, order) => {
    const date = order.orderDate.toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + order.price
    return acc
  }, {} as Record<string, number>)

  return {
    usage: {
      totalSpent,
      totalOrders: recentOrders.length,
      averageOrder: recentOrders.length > 0 ? totalSpent / recentOrders.length : 0,
      ordersByService,
      dailySpending: Object.entries(dailySpending).map(([date, amount]) => ({
        date,
        amount,
      })),
    },
    insights: {
      topService: Object.entries(spendingByService).sort(([,a], [,b]) => b - a)[0],
      monthlyTrend: calculateMonthlyTrend(recentOrders),
      costPerFollower: calculateCostPerFollower(recentOrders),
    },
  }
}

function calculateMonthlyTrend(orders: any[]) {
  const currentMonth = orders.filter(order => {
    const orderDate = new Date(order.orderDate)
    const now = new Date()
    return orderDate.getMonth() === now.getMonth() && 
           orderDate.getFullYear() === now.getFullYear()
  })

  const lastMonth = orders.filter(order => {
    const orderDate = new Date(order.orderDate)
    const now = new Date()
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return orderDate.getMonth() === lastMonthDate.getMonth() && 
           orderDate.getFullYear() === lastMonthDate.getFullYear()
  })

  const currentSpent = currentMonth.reduce((sum, order) => sum + order.price, 0)
  const lastSpent = lastMonth.reduce((sum, order) => sum + order.price, 0)

  const trend = lastSpent > 0 ? ((currentSpent - lastSpent) / lastSpent) * 100 : 0

  return { current: currentSpent, last: lastSpent, trend }
}

function calculateCostPerFollower(orders: any[]) {
  const followerOrders = orders.filter(order => order.serviceType === 'followers')
  const totalSpent = followerOrders.reduce((sum, order) => sum + order.price, 0)
  const totalFollowers = followerOrders.reduce((sum, order) => sum + order.quantity, 0)
  
  return totalFollowers > 0 ? totalSpent / totalFollowers : 0
}
