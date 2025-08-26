import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, BarChart3, Zap, Shield, Smartphone } from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"

export default async function HomePage() {
  const user = await currentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DevNest-JM</span>
          </div>
          <div className="flex items-center space-x-4">
            <SignInButton>
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button className="bg-accent hover:bg-accent/90">Get Started</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Grow Your Instagram
              <span className="text-accent block">Authentically</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Professional Instagram growth platform by DevNest-JM, trusted by marketers and influencers. Get real
              followers, boost engagement, and track your success with advanced analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8 py-6">
                  Start Growing Today
                </Button>
              </SignUpButton>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools and insights to help you build an authentic Instagram presence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Smart Targeting",
                description: "AI-powered audience targeting based on hashtags, competitors, and demographics",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Detailed insights into follower growth, engagement rates, and campaign performance",
              },
              {
                icon: Zap,
                title: "Automated Growth",
                description: "Safe, compliant automation that grows your account while you focus on content",
              },
              {
                icon: Shield,
                title: "Account Safety",
                description: "Built-in safety limits and Instagram compliance to protect your account",
              },
              {
                icon: Smartphone,
                title: "Mobile Optimized",
                description: "Manage your growth campaigns on any device with our responsive dashboard",
              },
              {
                icon: TrendingUp,
                title: "Real Results",
                description: "Track real follower growth and engagement improvements with detailed reporting",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="animate-slide-in-right border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Grow Your Instagram?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of successful creators and businesses using DevNest-JM
          </p>
          <SignUpButton>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8 py-6">
              Start Your Free Trial
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-semibold">DevNest-JM</span>
          </div>
          <p className="text-muted-foreground">© 2024 DevNest-JM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
