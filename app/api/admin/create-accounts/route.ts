import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { accountCreationManager } from "@/lib/instagram-account-creator"

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

    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { count, scheduled } = await request.json()

    if (scheduled) {
      // Start scheduled creation
      const accountsPerDay = count || 10
      await accountCreationManager.startScheduledCreation(accountsPerDay)
      
      return NextResponse.json({ 
        success: true, 
        message: `Scheduled creation started: ${accountsPerDay} accounts per day` 
      })
    } else {
      // Create accounts immediately
      const batchCount = Math.min(count || 5, 20) // Limit to 20 accounts per batch
      
      // Start the creation process in the background
      accountCreationManager.createBatchAccounts(batchCount).catch(console.error)
      
      return NextResponse.json({ 
        success: true, 
        message: `Account creation started: ${batchCount} accounts` 
      })
    }

  } catch (error) {
    console.error("Account creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get created accounts statistics
    const stats = await prisma.createdAccount.aggregate({
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    })

    const recentAccounts = await prisma.createdAccount.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        isActive: true,
        accountType: true
      }
    })

    return NextResponse.json({
      totalAccounts: stats._count.id,
      recentAccounts
    })

  } catch (error) {
    console.error("Get accounts API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
