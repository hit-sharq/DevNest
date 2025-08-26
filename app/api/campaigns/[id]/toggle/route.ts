import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()
    const campaignId = params.id

    // Verify the campaign belongs to the user
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        user: {
          clerkId: user.id,
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Update campaign status
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
    })

    return NextResponse.json({ success: true, campaign: updatedCampaign })
  } catch (error) {
    console.error("Campaign toggle error:", error)
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 })
  }
}
