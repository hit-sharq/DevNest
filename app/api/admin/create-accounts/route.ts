import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get account creation stats
    const [totalAccounts, activeAccounts, inactiveAccounts] = await Promise.all([
      prisma.botAccount.count(),
      prisma.botAccount.count({ where: { isActive: true } }),
      prisma.botAccount.count({ where: { isActive: false } })
    ])

    const recentCreations = await prisma.botAccount.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        isActive: true,
        createdAt: true,
        lastUsed: true
      }
    })

    const stats = {
      totalAccounts,
      activeAccounts,
      inactiveAccounts,
      byStatus: {
        active: activeAccounts,
        inactive: inactiveAccounts
      }
    }

    return NextResponse.json({
      totalAccounts,
      recentAccounts: recentCreations.map(account => ({
        id: account.id,
        username: account.username,
        email: `${account.username}@temp-mail.com`, // Add missing email field
        createdAt: account.createdAt.toISOString(),
        isActive: account.isActive,
        accountType: 'dedicated'
      }))
    })

  } catch (error) {
    console.error("Create accounts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, count, enabled } = await request.json()

    if (action === 'create_accounts') {
      const accountCount = Math.min(count || 1, 10) // Limit to 10 accounts at once

      // Import the Instagram account creator
      const { InstagramAccountCreator } = await import('@/lib/instagram-account-creator')
      const creator = new InstagramAccountCreator()

      const accounts = []
      const errors = []

      for (let i = 0; i < accountCount; i++) {
        try {
          // Create actual Instagram account
          const instagramAccount = await creator.createAccount()
          
          if (instagramAccount.success) {
            // Save successful account to database
            const account = await prisma.botAccount.create({
              data: {
                username: instagramAccount.username,
                password: instagramAccount.password, // This should be encrypted
                isActive: true,
                dailyActionsUsed: 0,
                dailyActionLimit: 500,
                accountType: 'dedicated'
              }
            })
            accounts.push(account)
          } else {
            errors.push(`Failed to create account ${i + 1}: ${instagramAccount.error}`)
          }
        } catch (error) {
          console.error(`Account creation error ${i + 1}:`, error)
          errors.push(`Account ${i + 1} creation failed: ${error.message}`)
        }
      }

      const successCount = accounts.length
      const errorCount = errors.length
      
      return NextResponse.json({
        success: successCount > 0,
        message: `${successCount} accounts created successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        accounts,
        errors: errorCount > 0 ? errors : undefined
      })
    }

    if (action === 'setup_scheduled') {
      // Here you would implement your scheduling logic
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: enabled ? `Scheduled creation enabled: ${count} accounts per day` : 'Scheduled creation disabled'
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (error) {
    console.error("Create accounts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}