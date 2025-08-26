import { currentUser } from "@clerk/nextjs/server"
import { PricingPlans } from "@/components/pricing/pricing-plans"
import { PricingHeader } from "@/components/pricing/pricing-header"
import { PricingFAQ } from "@/components/pricing/pricing-faq"

export default async function PricingPage() {
  const user = await currentUser()

  return (
    <div className="min-h-screen bg-background">
      <PricingHeader />
      <main className="container mx-auto px-4 py-16 space-y-16">
        <PricingPlans user={user} />
        <PricingFAQ />
      </main>
    </div>
  )
}
