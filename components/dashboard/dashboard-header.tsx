import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { TrendingUp, Plus, Shield, Zap, Clock } from "lucide-react"
import Link from "next/link"
import { isAdmin } from "@/lib/admin"
import { currentUser } from "@clerk/nextjs/server"
import { DashboardHeaderClient } from "./dashboard-header-client"

interface DashboardHeaderProps {
  user: any
}

export async function DashboardHeader({ user }: DashboardHeaderProps) {
  const clerkUser = await currentUser()
  const showAdminPanel = clerkUser && isAdmin(clerkUser.id)
  const userId = clerkUser?.id
  const accounts = user?.accounts || []

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
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

          <div className="flex items-center space-x-4">
            <DashboardHeaderClient accounts={accounts} userId={userId} />
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