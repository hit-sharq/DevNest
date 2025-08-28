
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const offset = (page - 1) * limit

    const whereCondition = status ? { status } : {}

    const [accounts, totalAccounts] = await Promise.all([
      prisma.botAccount.findMany({
        where: whereCondition,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          dailyLimit: true,
          currentUsage: true,
          lastUsed: true,
          createdAt: true
        }
      }),
      prisma.botAccount.count({ where: whereCondition })
    ])

    return NextResponse.json({
      accounts,
      pagination: {
        total: totalAccounts,
        limit,
        offset,
        hasMore: offset + limit < totalAccounts
      }
    })

  } catch (error) {
    console.error("Bot accounts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, accountIds, status } = await request.json()

    switch (action) {
      case 'update_status':
        await prisma.botAccount.updateMany({
          where: { id: { in: accountIds } },
          data: { status }
        })
        return NextResponse.json({ 
          success: true, 
          message: `Updated ${accountIds.length} accounts to ${status}` 
        })

      case 'delete':
        await prisma.botAccount.deleteMany({
          where: { id: { in: accountIds } }
        })
        return NextResponse.json({ 
          success: true, 
          message: `Deleted ${accountIds.length} accounts` 
        })

      case 'reset_usage':
        await prisma.botAccount.updateMany({
          where: { id: { in: accountIds } },
          data: { currentUsage: 0 }
        })
        return NextResponse.json({ 
          success: true, 
          message: `Reset usage for ${accountIds.length} accounts` 
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Bot accounts action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
