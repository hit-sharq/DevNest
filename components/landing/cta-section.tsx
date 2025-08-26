import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-accent/10 to-secondary/10">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Ready to Transform Your Instagram?</h2>

          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
            Join DevNest today and start building the Instagram presence you've always wanted. No contracts, cancel
            anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8 py-6" asChild>
              <Link href="/sign-up">
                <TrendingUp className="w-5 h-5 mr-2" />
                Start Your Growth Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted mt-6">Free 7-day trial • No credit card required • Cancel anytime</p>
        </div>
      </div>
    </section>
  )
}
