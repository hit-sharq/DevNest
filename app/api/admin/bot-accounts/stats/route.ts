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

    const stats = await botAccountManager.getAccountStats()
    return NextResponse.json(stats)

  } catch (error) {
    console.error("Bot account stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
