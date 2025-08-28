
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Verify campaign ownership
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        account: {
          userId: user.id
        }
      },
      include: {
        actions: {
          orderBy: { createdAt: 'desc' },
          take: 100 // Last 100 actions
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Generate analytics data for the last 7 days
    const analyticsData = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // Count actions by type for this date
      const dayActions = campaign.actions.filter(action => 
        action.createdAt.toISOString().split('T')[0] === dateStr
      )

      const follows = dayActions.filter(action => action.type === 'FOLLOW').length
      const likes = dayActions.filter(action => action.type === 'LIKE').length
      const comments = dayActions.filter(action => action.type === 'COMMENT').length

      analyticsData.push({
        date: dateStr,
        follows,
        likes,
        comments
      })
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching campaign analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaign analytics" },
      { status: 500 }
    )
  }
}
