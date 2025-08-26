
import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, username, displayName } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Check if user owns this userId
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser || dbUser.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if username already exists for this user
    const existingAccount = await prisma.instagramAccount.findFirst({
      where: {
        userId: userId,
        username: username.toLowerCase()
      }
    })

    if (existingAccount) {
      return NextResponse.json({ error: "This Instagram account is already connected" }, { status: 400 })
    }

    // Simple username validation (you can enhance this)
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
      return NextResponse.json({ error: "Invalid Instagram username format" }, { status: 400 })
    }

    // Create the Instagram account
    const instagramAccount = await prisma.instagramAccount.create({
      data: {
        userId: userId,
        username: username.toLowerCase(),
        displayName: displayName || username,
        followersCount: 0, // Default values - you can fetch real data later
        followingCount: 0,
        postsCount: 0,
        isActive: true,
      }
    })

    return NextResponse.json({ success: true, account: instagramAccount })

  } catch (error) {
    console.error("Instagram connect error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
