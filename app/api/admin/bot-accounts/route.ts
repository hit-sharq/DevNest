import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { botAccountManager } from "@/lib/bot-account-manager"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const accounts = await prisma.botAccount.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        isActive: true,
        dailyActionsUsed: true,
        dailyActionLimit: true,
        accountType: true,
        lastUsed: true,
        createdAt: true
      }
    })

    return NextResponse.json(accounts)

  } catch (error) {
    console.error("Bot accounts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { username, password, accountType } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    await botAccountManager.addDedicatedBotAccount(username, password)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Bot account creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
