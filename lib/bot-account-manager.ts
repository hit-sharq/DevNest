
import { prisma } from './prisma'

export interface BotAccount {
  id: string
  username: string
  password: string
  isActive: boolean
  dailyActionsUsed: number
  dailyActionLimit: number
  lastUsed: Date
  accountType: 'dedicated' | 'user_contributed' | 'partner'
  contributorUserId?: string
}

export class BotAccountManager {
  
  // Get available bot accounts for performing actions
  async getAvailableBotAccounts(actionType: 'follow' | 'like' | 'comment', count: number = 1): Promise<BotAccount[]> {
    const accounts = await prisma.botAccount.findMany({
      where: {
        isActive: true,
        dailyActionsUsed: {
          lt: prisma.botAccount.fields.dailyActionLimit
        },
        // Don't use accounts that were used in the last hour
        lastUsed: {
          lt: new Date(Date.now() - 60 * 60 * 1000)
        }
      },
      orderBy: {
        dailyActionsUsed: 'asc' // Prefer accounts with fewer actions used
      },
      take: count
    })

    return accounts
  }

  // Add a user-contributed account to the bot pool
  async addUserContributedAccount(userId: string, username: string, password: string): Promise<void> {
    await prisma.botAccount.create({
      data: {
        username,
        password: this.encryptPassword(password), // You'd implement encryption
        isActive: true,
        dailyActionsUsed: 0,
        dailyActionLimit: 100, // Conservative limit for user accounts
        lastUsed: new Date(),
        accountType: 'user_contributed',
        contributorUserId: userId
      }
    })

    // Give the user credits for contributing their account
    await this.giveUserCredits(userId, 1000)
  }

  // Add a dedicated bot account
  async addDedicatedBotAccount(username: string, password: string): Promise<void> {
    await prisma.botAccount.create({
      data: {
        username,
        password: this.encryptPassword(password),
        isActive: true,
        dailyActionsUsed: 0,
        dailyActionLimit: 500, // Higher limit for dedicated bots
        lastUsed: new Date(),
        accountType: 'dedicated'
      }
    })
  }

  // Track account usage
  async trackAccountUsage(accountId: string, actionType: string): Promise<void> {
    await prisma.botAccount.update({
      where: { id: accountId },
      data: {
        dailyActionsUsed: {
          increment: 1
        },
        lastUsed: new Date()
      }
    })

    // Log the action for analytics
    await prisma.botAction.create({
      data: {
        accountId,
        actionType,
        timestamp: new Date()
      }
    })
  }

  // Reset daily usage counters (run daily via cron)
  async resetDailyCounters(): Promise<void> {
    await prisma.botAccount.updateMany({
      data: {
        dailyActionsUsed: 0
      }
    })
  }

  // Reward system for contributing accounts
  private async giveUserCredits(userId: string, credits: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: credits
        }
      }
    })
  }

  private encryptPassword(password: string): string {
    // Implement proper encryption here
    // For demo, just return as-is (DON'T DO THIS IN PRODUCTION)
    return password
  }

  // Check account health and disable problematic ones
  async monitorAccountHealth(): Promise<void> {
    const accounts = await prisma.botAccount.findMany({
      where: { isActive: true }
    })

    for (const account of accounts) {
      // Check if account has been banned or has issues
      // You'd implement Instagram API checks here
      const isHealthy = await this.checkAccountHealth(account.username)
      
      if (!isHealthy) {
        await prisma.botAccount.update({
          where: { id: account.id },
          data: { isActive: false }
        })
      }
    }
  }

  private async checkAccountHealth(username: string): Promise<boolean> {
    // Implement health checks:
    // - Can log in successfully
    // - Account not banned/restricted
    // - Profile still accessible
    return true // Placeholder
  }

  // Get account statistics
  async getAccountStats(): Promise<any> {
    const stats = await prisma.botAccount.aggregate({
      _count: {
        id: true
      },
      _sum: {
        dailyActionsUsed: true
      },
      where: {
        isActive: true
      }
    })

    const accountsByType = await prisma.botAccount.groupBy({
      by: ['accountType'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    })

    return {
      totalAccounts: stats._count.id,
      totalActionsToday: stats._sum.dailyActionsUsed,
      accountsByType
    }
  }
}

export const botAccountManager = new BotAccountManager()
