import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Shield, Home } from "lucide-react"
import Link from "next/link"

interface AdminHeaderProps {
  user: any
}

export function AdminHeader({ user }: AdminHeaderProps) {
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
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                User View
              </Link>
            </Button>
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
