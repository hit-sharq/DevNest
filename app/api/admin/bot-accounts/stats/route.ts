
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

    // Get bot account statistics
    const [
      totalAccounts,
      activeAccounts,
      bannedAccounts,
      accountsByStatus,
      recentActivity
    ] = await Promise.all([
      prisma.botAccount.count(),
      prisma.botAccount.count({ where: { status: 'active' } }),
      prisma.botAccount.count({ where: { status: 'banned' } }),
      prisma.botAccount.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.botAccount.findMany({
        take: 10,
        orderBy: { lastUsed: 'desc' },
        select: {
          id: true,
          username: true,
          status: true,
          currentUsage: true,
          dailyLimit: true,
          lastUsed: true
        }
      })
    ])

    const stats = {
      total: totalAccounts,
      active: activeAccounts,
      banned: bannedAccounts,
      byStatus: accountsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id
        return acc
      }, {} as Record<string, number>),
      recentActivity
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error("Bot accounts stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
