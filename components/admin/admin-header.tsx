"use client"

import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Shield, Home, Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface AdminHeaderProps {
  user: any
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Admin Panel</span>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-foreground">
                Overview
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/admin/users">Users</Link>
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/admin/campaigns">Campaigns</Link>
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/admin/revenue">Revenue</Link>
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/admin/settings">Settings</Link>
              </Button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" className="hidden sm:flex bg-transparent" asChild>
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                User View
              </Link>
            </Button>

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
                      Overview
                    </Button>
                    <Button variant="ghost" className="justify-start text-left" asChild>
                      <Link href="/admin/users" onClick={() => setIsOpen(false)}>
                        Users
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-left" asChild>
                      <Link href="/admin/campaigns" onClick={() => setIsOpen(false)}>
                        Campaigns
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-left" asChild>
                      <Link href="/admin/revenue" onClick={() => setIsOpen(false)}>
                        Revenue
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-left" asChild>
                      <Link href="/admin/settings" onClick={() => setIsOpen(false)}>
                        Settings
                      </Link>
                    </Button>
                    <div className="border-t pt-4">
                      <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                          <Home className="w-4 h-4 mr-2" />
                          User View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
