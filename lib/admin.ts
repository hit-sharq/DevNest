import { AuthService } from "./auth"

/**
 * @deprecated Use AuthService.isAdmin() instead
 * Check if a Clerk user ID is an admin based on environment variables
 * Admin IDs should be stored in ADMIN_USER_IDS as comma-separated values
 * Example: ADMIN_USER_IDS=user_123,user_456,user_789
 */
export function isAdmin(clerkUserId: string): boolean {
  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || []
  return adminIds.includes(clerkUserId)
}

/**
 * @deprecated Use AuthService.isAdmin() instead
 * Get all admin user IDs from environment variables
 */
export function getAdminUserIds(): string[] {
  return process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || []
}

// New database-backed admin functions
export const checkAdminStatus = AuthService.isAdmin
export const requireAdmin = AuthService.requireAdmin
export const requireModerator = AuthService.requireModerator
