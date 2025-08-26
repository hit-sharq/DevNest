import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const accounts = await prisma.instagramAccount.findMany({
      where: { userId: user.id },
      orderBy: { connectedAt: "desc" }
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Error fetching Instagram accounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    )
  }
}
