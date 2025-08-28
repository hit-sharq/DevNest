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

    const [totalAccounts, activeAccounts, inactiveAccounts, averageUsage] = await Promise.all([
      prisma.botAccount.count(),
      prisma.botAccount.count({ where: { isActive: true } }),
      prisma.botAccount.count({ where: { isActive: false } }),
      prisma.botAccount.aggregate({
        _avg: { dailyActionsUsed: true }
      })
    ])

    const stats = {
      totalAccounts,
      activeAccounts,
      inactiveAccounts,
      averageUsage: Math.round(averageUsage._avg.dailyActionsUsed || 0),
      utilization: totalAccounts > 0 ? Math.round((activeAccounts / totalAccounts) * 100) : 0
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error("Bot accounts stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}