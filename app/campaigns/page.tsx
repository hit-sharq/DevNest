import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CampaignsHeader } from "@/components/campaigns/campaigns-header"
import { CampaignsGrid } from "@/components/campaigns/campaigns-grid"
import { CampaignStats } from "@/components/campaigns/campaign-stats"

export default async function CampaignsPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      campaigns: {
        include: {
          account: true,
          actions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
        orderBy: { createdAt: "desc" },
      },
      instagramAccounts: true,
    },
  })

  if (!dbUser) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <CampaignsHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Campaign Management</h1>
          <p className="text-muted-foreground">Create and manage your Instagram growth campaigns</p>
        </div>

        <CampaignStats campaigns={dbUser.campaigns} />
        <CampaignsGrid campaigns={dbUser.campaigns} accounts={dbUser.instagramAccounts} userId={dbUser.id} />
      </main>
    </div>
  )
}
