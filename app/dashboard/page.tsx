import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CampaignsList } from "@/components/dashboard/campaigns-list"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { InstagramAccounts } from "@/components/dashboard/instagram-accounts"
import { isAdmin } from "@/lib/admin"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

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
    include: {
      instagramAccounts: {
        include: {
          campaigns: true,
          followers: true,
        },
      },
      campaigns: {
        include: {
          account: true,
          actions: true,
        },
      },
    },
  })

  const showAdminPanel = isAdmin(user.id)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        user={dbUser} 
        showAdminPanel={showAdminPanel}
        userId={user.id}
        accounts={dbUser.instagramAccounts}
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome back, {user.firstName || "User"}!</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Here's what's happening with your Instagram growth</p>
        </div>

        <StatsCards user={dbUser} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <AnalyticsChart userId={dbUser.id} />
            <CampaignsList campaigns={dbUser.campaigns} />
          </div>

          <div className="space-y-6 sm:space-y-8">
            <InstagramAccounts accounts={dbUser.instagramAccounts} userId={dbUser.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
