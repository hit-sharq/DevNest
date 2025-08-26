import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      name,
      description,
      accountId,
      targetType,
      targetValue,
      dailyFollowLimit,
      dailyUnfollowLimit,
      dailyLikeLimit,
      dailyCommentLimit,
      userId,
    } = await request.json()

    // Validate required fields
    if (!name || !accountId || !targetType || !targetValue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the account belongs to the user
    const account = await prisma.instagramAccount.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
    })

    if (!account) {
      return NextResponse.json({ error: "Instagram account not found" }, { status: 404 })
    }

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        userId,
        accountId,
        targetType,
        targetValue,
        dailyFollowLimit: Number.parseInt(dailyFollowLimit),
        dailyUnfollowLimit: Number.parseInt(dailyUnfollowLimit),
        dailyLikeLimit: Number.parseInt(dailyLikeLimit),
        dailyCommentLimit: Number.parseInt(dailyCommentLimit),
        status: "active",
      },
      include: {
        account: true,
      },
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error("Campaign creation error:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}
