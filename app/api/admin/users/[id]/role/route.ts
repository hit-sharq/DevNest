import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if current user is admin
    const currentDbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!currentDbUser || (currentDbUser.role !== "admin" && currentDbUser.role !== "super_admin")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { role } = await request.json()
    const targetUserId = params.id

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Role update error:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
}
