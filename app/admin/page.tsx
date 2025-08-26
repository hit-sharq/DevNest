import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { RecentUsers } from "@/components/admin/recent-users"
import { PlatformAnalytics } from "@/components/admin/platform-analytics"
import { SystemHealth } from "@/components/admin/system-health"

export default async function AdminPage() {
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

  // Get platform statistics
  const [totalUsers, totalCampaigns, totalRevenue, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count(),
    prisma.user.count({ where: { subscriptionStatus: "active" } }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        campaigns: true,
        instagramAccounts: true,
      },
    }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={dbUser} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        <AdminStats totalUsers={totalUsers} totalCampaigns={totalCampaigns} activeSubscriptions={totalRevenue} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PlatformAnalytics />
            <RecentUsers users={recentUsers} />
          </div>

          <div className="space-y-8">
            <SystemHealth />
          </div>
        </div>
      </main>
    </div>
  )
}
