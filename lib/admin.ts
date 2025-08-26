/**
 * Admin utility functions for environment-based admin checking
 */

/**
 * Check if a Clerk user ID is an admin based on environment variables
 * Admin IDs should be stored in ADMIN_USER_IDS as comma-separated values
 * Example: ADMIN_USER_IDS=user_123,user_456,user_789
 */
export function isAdmin(clerkUserId: string): boolean {
  const adminIds = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || []
  return adminIds.includes(clerkUserId)
}

/**
 * Get all admin user IDs from environment variables
 */
export function getAdminUserIds(): string[] {
  return process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()) || []
}
