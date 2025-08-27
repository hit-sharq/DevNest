
"use client"

import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { TrendingUp, Plus, Shield, Zap, Clock } from "lucide-react"
import Link from "next/link"
import { DashboardHeaderClient } from "./dashboard-header-client"
import { useEffect, useState } from "react"

interface DashboardHeaderProps {
  user: any
  showAdminPanel: boolean
  userId?: string
  accounts: any[]
}

function ClientUserButton() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-8 h-8",
        },
      }}
    />
  )
}

export function DashboardHeader({ user, showAdminPanel, userId, accounts }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">DevNest-JM</span>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-foreground">
                Dashboard
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/campaigns">Campaigns</Link>
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Analytics
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/billing">Billing</Link>
              </Button>
              {showAdminPanel && (
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link href="/admin" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                </Button>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <DashboardHeaderClient accounts={accounts} userId={userId} />
            <ClientUserButton />
          </div>
        </div>
      </div>
    </header>
  )
}
