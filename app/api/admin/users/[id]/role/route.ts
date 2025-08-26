import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdmin(user.id)) {
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
