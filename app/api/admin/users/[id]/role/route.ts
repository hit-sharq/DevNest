import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { userRoleSchema, validateRequest } from "@/lib/validation"
import { ErrorHandler, generateRequestId, withErrorHandler } from "@/lib/error-handler"

async function updateUserRoleHandler(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const requestId = generateRequestId()

  // Require admin authentication
  const adminUser = await AuthService.requireAdmin()

  const requestData = await request.json()
  const validation = validateRequest(userRoleSchema, { ...requestData, userId: params.id })

  if (!validation.success) {
    throw ErrorHandler.validationError("Invalid request data", validation.error, requestId)
  }

  const { userId, role } = validation.data

  // Update user role using AuthService
  const success = await AuthService.updateUserRole(userId, role, adminUser.clerkId)

  if (!success) {
    throw ErrorHandler.serviceUnavailable("Failed to update user role", requestId)
  }

  return NextResponse.json({
    success: true,
    message: `User role updated to ${role}`,
    requestId,
  })
}

export const PATCH = withErrorHandler(updateUserRoleHandler)
