import { Button } from "@/components/ui/button"
import { TrendingUp, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto text-center max-w-4xl">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Grow Your Instagram
            <span className="text-accent block">Authentically</span>
          </h1>

          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of creators and businesses using DevNest to build genuine engagement, attract real followers,
            and grow their Instagram presence organically.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8 py-6" asChild>
              <Link href="/sign-up">
                <TrendingUp className="w-5 h-5 mr-2" />
                Start Growing Today
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
              <Link href="/dashboard">View Demo</Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              <span>10,000+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              <span>2M+ Followers Gained</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>95% Success Rate</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
