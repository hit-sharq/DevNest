import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function PricingHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-foreground">Choose Your Plan</h1>
            <p className="text-muted-foreground">Scale your Instagram growth with the right plan</p>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>
    </header>
  )
}
