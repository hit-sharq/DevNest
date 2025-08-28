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

    // Get account creation stats
    const [totalAccounts, activeAccounts, inactiveAccounts] = await Promise.all([
      prisma.botAccount.count(),
      prisma.botAccount.count({ where: { isActive: true } }),
      prisma.botAccount.count({ where: { isActive: false } })
    ])

    const recentCreations = await prisma.botAccount.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        status: true,
        createdAt: true,
        lastUsed: true
      }
    })

    const stats = {
      totalAccounts,
      activeAccounts,
      inactiveAccounts,
      byStatus: {
        active: activeAccounts,
        inactive: inactiveAccounts
      }
    }

    return NextResponse.json({
      stats: stats,
      recentCreations
    })

  } catch (error) {
    console.error("Create accounts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, count } = await request.json()

    if (action === 'create_accounts') {
      const accountCount = Math.min(count || 1, 10) // Limit to 10 accounts at once

      // Create placeholder bot accounts (replace with actual Instagram account creation logic)
      const accounts = []
      for (let i = 0; i < accountCount; i++) {
        const account = await prisma.botAccount.create({
          data: {
            username: `bot_${Date.now()}_${i}`,
            email: `bot_${Date.now()}_${i}@temp-mail.com`,
            status: 'creating',
            dailyLimit: 500,
            currentUsage: 0
          }
        })
        accounts.push(account)
      }

      return NextResponse.json({
        success: true,
        message: `${accountCount} accounts queued for creation`,
        accounts
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (error) {
    console.error("Create accounts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}