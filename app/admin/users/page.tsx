import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { UsersTable } from "@/components/admin/users-table"
import { UsersStats } from "@/components/admin/users-stats"

export default async function AdminUsersPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (!isAdmin(user.id)) {
    redirect("/dashboard")
  }

  // Get or create user in database (for analytics purposes)
  const dbUser = await prisma.user.upsert({
    where: { clerkId: user.id },
    update: {
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    },
    create: {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    },
  })

  const users = await prisma.user.findMany({
    include: {
      campaigns: true,
      instagramAccounts: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={dbUser} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage platform users and their subscriptions</p>
        </div>

        <UsersStats users={users} />
        <UsersTable users={users} />
      </main>
    </div>
  )
}
