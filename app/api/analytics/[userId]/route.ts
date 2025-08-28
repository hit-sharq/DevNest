
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params

    // Get user's Instagram accounts
    const accounts = await prisma.instagramAccount.findMany({
      where: { userId },
      include: {
        followers: {
          orderBy: { createdAt: 'desc' },
          take: 30 // Last 30 days
        },
        campaigns: {
          include: {
            actions: true
          }
        }
      }
    })

    // Calculate daily analytics
    const analyticsData = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      let totalFollowers = 0
      let totalEngagement = 0
      let accountCount = 0

      for (const account of accounts) {
        // Get follower count for this date
        const followerRecord = account.followers.find(f => 
          f.createdAt.toISOString().split('T')[0] === dateStr
        )
        
        if (followerRecord) {
          totalFollowers += followerRecord.count
          accountCount++
        } else {
          // Use latest follower count if no record for this date
          const latestFollower = account.followers[0]
          if (latestFollower) {
            totalFollowers += latestFollower.count
            accountCount++
          }
        }

        // Calculate engagement from campaigns active on this date
        const activeCampaigns = account.campaigns.filter(campaign => {
          const campaignDate = campaign.createdAt.toISOString().split('T')[0]
          return campaignDate <= dateStr && campaign.isActive
        })

        for (const campaign of activeCampaigns) {
          const dayActions = campaign.actions.filter(action => 
            action.createdAt.toISOString().split('T')[0] === dateStr
          )
          
          // Simple engagement calculation: actions per follower * 100
          const followerCount = followerRecord?.count || account.followers[0]?.count || 1
          const engagementRate = (dayActions.length / followerCount) * 100
          totalEngagement += engagementRate
        }
      }

      const avgFollowers = accountCount > 0 ? Math.round(totalFollowers / accountCount) : 0
      const avgEngagement = accountCount > 0 ? Number((totalEngagement / accountCount).toFixed(1)) : 0

      analyticsData.push({
        date: dateStr,
        followers: avgFollowers,
        engagement: avgEngagement
      })
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
