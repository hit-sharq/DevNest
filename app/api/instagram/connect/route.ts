import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { instagramConnectSchema, validateRequest } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestData = await request.json()

    const validation = validateRequest(instagramConnectSchema, requestData)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { userId, username, displayName } = validation.data

    // Check if user owns this userId
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser || dbUser.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if username already exists for this user
    const existingAccount = await prisma.instagramAccount.findFirst({
      where: {
        userId: userId,
        username: username,
      },
    })

    if (existingAccount) {
      return NextResponse.json({ error: "This Instagram account is already connected" }, { status: 400 })
    }

    // Create the Instagram account
    const instagramAccount = await prisma.instagramAccount.create({
      data: {
        userId: userId,
        username: username,
        displayName: displayName || username,
        followersCount: 0, // Default values - you can fetch real data later
        followingCount: 0,
        postsCount: 0,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, account: instagramAccount })
  } catch (error) {
    console.error("Instagram connect error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
