import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "./prisma"
import { logSecurityEvent } from "./security-utils"

export type UserRole = "user" | "admin" | "moderator"

export interface AuthUser {
  id: string
  clerkId: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class AuthService {
  /**
   * Get current authenticated user with database role information
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const clerkUser = await currentUser()
      if (!clerkUser) return null

      // Get user from database with role information
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
        select: {
          id: true,
          clerkId: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!dbUser) {
        // Create user if doesn't exist in database
        const newUser = await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            role: "user",
            isActive: true,
          },
          select: {
            id: true,
            clerkId: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        return newUser as AuthUser
      }

      return dbUser as AuthUser
    } catch (error) {
      console.error("Failed to get current user:", error)
      return null
    }
  }

  /**
   * Check if user has admin role
   */
  static async isAdmin(clerkUserId?: string): Promise<boolean> {
    try {
      let targetClerkId = clerkUserId

      if (!targetClerkId) {
        const clerkUser = await currentUser()
        if (!clerkUser) return false
        targetClerkId = clerkUser.id
      }

      // Check database role first
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: targetClerkId },
        select: { role: true, isActive: true },
      })

      if (dbUser && dbUser.isActive && dbUser.role === "admin") {
        return true
      }

      // Fallback to environment variable check for initial setup
      const adminIds = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || []
      return adminIds.includes(targetClerkId)
    } catch (error) {
      console.error("Failed to check admin status:", error)
      return false
    }
  }

  /**
   * Check if user has moderator or admin role
   */
  static async isModerator(clerkUserId?: string): Promise<boolean> {
    try {
      let targetClerkId = clerkUserId

      if (!targetClerkId) {
        const clerkUser = await currentUser()
        if (!clerkUser) return false
        targetClerkId = clerkUser.id
      }

      const dbUser = await prisma.user.findUnique({
        where: { clerkId: targetClerkId },
        select: { role: true, isActive: true },
      })

      return (dbUser?.isActive && (dbUser.role === "admin" || dbUser.role === "moderator")) || false
    } catch (error) {
      console.error("Failed to check moderator status:", error)
      return false
    }
  }

  /**
   * Verify user owns a resource
   */
  static async verifyResourceOwnership(
    resourceType: "instagramAccount" | "campaign" | "serviceOrder",
    resourceId: string,
    userId?: string,
  ): Promise<boolean> {
    try {
      let targetUserId = userId

      if (!targetUserId) {
        const user = await this.getCurrentUser()
        if (!user) return false
        targetUserId = user.id
      }

      switch (resourceType) {
        case "instagramAccount":
          const account = await prisma.instagramAccount.findFirst({
            where: { id: resourceId, userId: targetUserId },
          })
          return !!account

        case "campaign":
          const campaign = await prisma.campaign.findFirst({
            where: { id: resourceId, userId: targetUserId },
          })
          return !!campaign

        case "serviceOrder":
          const order = await prisma.serviceOrder.findFirst({
            where: { id: resourceId, userId: targetUserId },
          })
          return !!order

        default:
          return false
      }
    } catch (error) {
      console.error("Failed to verify resource ownership:", error)
      return false
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(targetUserId: string, newRole: UserRole, adminClerkId: string): Promise<boolean> {
    try {
      // Verify admin permissions
      const isAdminUser = await this.isAdmin(adminClerkId)
      if (!isAdminUser) {
        logSecurityEvent({
          type: "auth_failure",
          ip: "unknown",
          userAgent: "server",
          path: "/api/admin/users/role",
          details: { reason: "Non-admin attempted role change", adminClerkId, targetUserId },
        })
        return false
      }

      // Update role in database
      await prisma.user.update({
        where: { id: targetUserId },
        data: { role: newRole, updatedAt: new Date() },
      })

      return true
    } catch (error) {
      console.error("Failed to update user role:", error)
      return false
    }
  }

  /**
   * Require authentication middleware
   */
  static async requireAuth(): Promise<AuthUser> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error("Authentication required")
    }
    if (!user.isActive) {
      throw new Error("Account is inactive")
    }
    return user
  }

  /**
   * Require admin role middleware
   */
  static async requireAdmin(): Promise<AuthUser> {
    const user = await this.requireAuth()
    const isAdminUser = await this.isAdmin(user.clerkId)
    if (!isAdminUser) {
      throw new Error("Admin privileges required")
    }
    return user
  }

  /**
   * Require moderator role middleware
   */
  static async requireModerator(): Promise<AuthUser> {
    const user = await this.requireAuth()
    const isModeratorUser = await this.isModerator(user.clerkId)
    if (!isModeratorUser) {
      throw new Error("Moderator privileges required")
    }
    return user
  }
}

// Legacy compatibility functions
export const isAdmin = AuthService.isAdmin
export const getCurrentUser = AuthService.getCurrentUser
