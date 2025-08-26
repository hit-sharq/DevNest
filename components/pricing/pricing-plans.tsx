"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Building } from "lucide-react"
import { PaymentModal } from "./payment-modal"

interface PricingPlansProps {
  user: any
}

export function PricingPlans({ user }: PricingPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 29,
      description: "Perfect for getting started",
      icon: Zap,
      features: [
        "Up to 1 Instagram account",
        "50 follows per day",
        "100 likes per day",
        "Basic analytics",
        "Email support",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: 79,
      description: "Most popular for growing accounts",
      icon: Crown,
      features: [
        "Up to 3 Instagram accounts",
        "150 follows per day",
        "300 likes per day",
        "50 comments per day",
        "Advanced analytics",
        "Priority support",
        "Custom targeting",
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 199,
      description: "For agencies and large accounts",
      icon: Building,
      features: [
        "Unlimited Instagram accounts",
        "500 follows per day",
        "1000 likes per day",
        "200 comments per day",
        "Advanced analytics & reporting",
        "24/7 priority support",
        "Custom targeting & automation",
        "White-label dashboard",
        "API access",
      ],
      popular: false,
    },
  ]

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      window.location.href = "/sign-in"
      return
    }
    setSelectedPlan(planId)
    setShowPaymentModal(true)
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative hover:shadow-lg transition-all duration-300 ${
              plan.popular ? "border-accent shadow-lg scale-105" : "border-border/50"
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                Most Popular
              </Badge>
            )}

            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <plan.icon className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-base">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular ? "bg-accent hover:bg-accent/90" : "bg-secondary hover:bg-secondary/90"
                }`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {user ? "Choose Plan" : "Sign Up to Continue"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={plans.find((p) => p.id === selectedPlan)!}
          user={user}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  )
}
