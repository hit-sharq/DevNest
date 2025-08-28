
import { prisma } from "./prisma"
import { botAccountManager } from "./bot-account-manager"

export interface ContributionReward {
  type: "credits" | "free_services" | "premium_access"
  value: number
  description: string
}

export class AccountContributionSystem {
  // Reward tiers for contributing accounts
  private rewardTiers = {
    follower_based: {
      "0-1000": { credits: 500, description: "New account bonus" },
      "1000-5000": { credits: 1500, description: "Growing account bonus" },
      "5000-10000": { credits: 3000, description: "Established account bonus" },
      "10000+": { credits: 5000, description: "Influencer account bonus" }
    },
    engagement_based: {
      low: { credits: 200, description: "Low engagement multiplier" },
      medium: { credits: 500, description: "Medium engagement multiplier" },
      high: { credits: 1000, description: "High engagement multiplier" }
    }
  }

  async evaluateAccountValue(username: string): Promise<ContributionReward> {
    // In a real implementation, you'd use Instagram's basic info API
    // For now, we'll simulate account evaluation
    
    const mockFollowerCount = Math.floor(Math.random() * 50000)
    const mockEngagementRate = Math.random() * 10 // 0-10%
    
    let baseReward = 500
    
    // Calculate follower-based reward
    if (mockFollowerCount >= 10000) baseReward = 5000
    else if (mockFollowerCount >= 5000) baseReward = 3000
    else if (mockFollowerCount >= 1000) baseReward = 1500
    
    // Apply engagement multiplier
    let engagementMultiplier = 1
    if (mockEngagementRate > 5) engagementMultiplier = 2
    else if (mockEngagementRate > 2) engagementMultiplier = 1.5
    
    const finalReward = Math.floor(baseReward * engagementMultiplier)
    
    return {
      type: "credits",
      value: finalReward,
      description: `${mockFollowerCount} followers, ${mockEngagementRate.toFixed(1)}% engagement`
    }
  }

  async submitAccountForContribution(userId: string, username: string, password: string): Promise<{ success: boolean; reward?: ContributionReward; error?: string }> {
    try {
      // Verify account credentials (simplified)
      const isValid = await this.verifyInstagramCredentials(username, password)
      if (!isValid) {
        return { success: false, error: "Invalid Instagram credentials" }
      }

      // Check if account already exists
      const existingAccount = await prisma.botAccount.findFirst({
        where: { username }
      })

      if (existingAccount) {
        return { success: false, error: "Account already contributed" }
      }

      // Evaluate account value
      const reward = await this.evaluateAccountValue(username)

      // Add to bot account pool
      await botAccountManager.addUserContributedAccount(userId, username, password)

      // Give user their reward
      await this.giveReward(userId, reward)

      // Log the contribution
      await prisma.accountContribution.create({
        data: {
          userId,
          username,
          rewardType: reward.type,
          rewardValue: reward.value,
          contributedAt: new Date()
        }
      })

      return { success: true, reward }
    } catch (error) {
      console.error("Account contribution error:", error)
      return { success: false, error: "Failed to process contribution" }
    }
  }

  private async verifyInstagramCredentials(username: string, password: string): Promise<boolean> {
    // In production, you'd verify these credentials
    // For now, return true for non-empty credentials
    return username.length > 0 && password.length > 0
  }

  private async giveReward(userId: string, reward: ContributionReward): Promise<void> {
    if (reward.type === "credits") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: reward.value }
        }
      })
    }
  }

  // Get user's contribution history
  async getUserContributions(userId: string) {
    return await prisma.accountContribution.findMany({
      where: { userId },
      orderBy: { contributedAt: "desc" }
    })
  }

  // Get platform contribution stats
  async getContributionStats() {
    const [totalContributions, totalRewardsGiven, topContributors] = await Promise.all([
      prisma.accountContribution.count(),
      prisma.accountContribution.aggregate({
        _sum: { rewardValue: true }
      }),
      prisma.accountContribution.groupBy({
        by: ["userId"],
        _count: { id: true },
        _sum: { rewardValue: true },
        orderBy: { _count: { id: "desc" } },
        take: 10
      })
    ])

    return {
      totalContributions,
      totalRewardsGiven: totalRewardsGiven._sum.rewardValue || 0,
      topContributors
    }
  }
}

export const accountContributionSystem = new AccountContributionSystem()
