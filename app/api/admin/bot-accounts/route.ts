
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
    const isActive = searchParams.get('status') === 'active' ? true : searchParams.get('status') === 'inactive' ? false : undefined
    const offset = (page - 1) * limit

    const whereCondition = isActive !== undefined ? { isActive } : {}

    const [accounts, totalAccounts] = await Promise.all([
      prisma.botAccount.findMany({
        where: whereCondition,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          isActive: true,
          dailyActionLimit: true,
          dailyActionsUsed: true,
          lastUsed: true,
          createdAt: true,
          accountType: true
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

    const { action, accountIds, isActive } = await request.json()

    switch (action) {
      case 'update_status':
        await prisma.botAccount.updateMany({
          where: { id: { in: accountIds } },
          data: { isActive }
        })
        return NextResponse.json({ 
          success: true, 
          message: `Updated ${accountIds.length} accounts to ${isActive ? 'active' : 'inactive'}` 
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
          data: { dailyActionsUsed: 0 }
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
