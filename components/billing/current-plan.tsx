import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"

interface CurrentPlanProps {
  user: any
}

export function CurrentPlan({ user }: CurrentPlanProps) {
  const planDetails = {
    free: { name: "Free", price: 0, color: "bg-gray-500" },
    basic: { name: "Basic", price: 29, color: "bg-blue-500" },
    pro: { name: "Pro", price: 79, color: "bg-purple-500" },
    enterprise: { name: "Enterprise", price: 199, color: "bg-orange-500" },
  }

  const currentPlan = planDetails[user.planType as keyof typeof planDetails] || planDetails.free

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-accent" />
          <span>Current Plan</span>
        </CardTitle>
        <CardDescription>Your active subscription details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${currentPlan.color}`} />
            <div>
              <h3 className="font-semibold text-lg">{currentPlan.name} Plan</h3>
              <p className="text-muted-foreground">
                {currentPlan.price > 0 ? `$${currentPlan.price}/month` : "Free forever"}
              </p>
            </div>
          </div>
          <Badge variant={user.subscriptionStatus === "active" ? "default" : "secondary"}>
            {user.subscriptionStatus || "inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Next billing: Jan 15, 2024</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CreditCard className="w-4 h-4" />
            <span>Auto-renewal: {user.subscriptionStatus === "active" ? "On" : "Off"}</span>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Link href="/pricing">
            <Button className="bg-accent hover:bg-accent/90">
              {user.planType === "free" ? "Upgrade Plan" : "Change Plan"}
            </Button>
          </Link>
          {user.subscriptionStatus === "active" && <Button variant="outline">Cancel Subscription</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
