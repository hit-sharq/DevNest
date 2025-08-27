"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { TrendingUp, Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DevNest</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-muted hover:text-foreground">
              Features
            </Button>
            <Button variant="ghost" className="text-muted hover:text-foreground">
              Pricing
            </Button>
            <Button variant="ghost" className="text-muted hover:text-foreground">
              Testimonials
            </Button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button className="bg-accent hover:bg-accent/90" asChild>
              <Link href="/sign-up">Start Growing</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <Button variant="ghost" className="justify-start text-left" onClick={() => setIsOpen(false)}>
                    Features
                  </Button>
                  <Button variant="ghost" className="justify-start text-left" onClick={() => setIsOpen(false)}>
                    Pricing
                  </Button>
                  <Button variant="ghost" className="justify-start text-left" onClick={() => setIsOpen(false)}>
                    Testimonials
                  </Button>
                  <div className="border-t pt-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button className="w-full bg-accent hover:bg-accent/90" asChild>
                      <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                        Start Growing
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
