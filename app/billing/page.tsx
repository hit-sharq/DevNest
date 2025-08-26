import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BillingHeader } from "@/components/billing/billing-header"
import { CurrentPlan } from "@/components/billing/current-plan"
import { BillingHistory } from "@/components/billing/billing-history"

export default async function BillingPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  })

  if (!dbUser) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <BillingHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CurrentPlan user={dbUser} />
            <BillingHistory user={dbUser} />
          </div>
        </div>
      </main>
    </div>
  )
}
