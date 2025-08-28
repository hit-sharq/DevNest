import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, BarChart3, Shield, Zap, Heart } from "lucide-react"

const features = [
  {
    icon: Target,
    title: "Smart Targeting",
    description: "AI-powered audience targeting to reach users genuinely interested in your content and niche.",
  },
  {
    icon: Users,
    title: "Real Followers",
    description: "Attract authentic followers who engage with your content, not bots or fake accounts.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track your growth with detailed insights, engagement metrics, and performance analytics.",
  },
  {
    icon: Shield,
    title: "Safe & Compliant",
    description: "100% Instagram-compliant growth methods that protect your account from penalties.",
  },
  {
    icon: Zap,
    title: "Automated Growth",
    description: "Set it and forget it. Our platform works 24/7 to grow your Instagram presence.",
  },
  {
    icon: Heart,
    title: "Engagement Boost",
    description: "Increase likes, comments, and story views from users who truly care about your content.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Everything You Need to Grow</h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Powerful features designed to help you build an authentic Instagram presence and connect with your ideal
            audience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="animate-slide-in-right border-border hover:shadow-lg transition-shadow h-full">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-muted leading-relaxed text-sm sm:text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
