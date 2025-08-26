import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal } from "lucide-react"

interface RecentUsersProps {
  users: any[]
}

export function RecentUsers({ users }: RecentUsersProps) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Recent Users</CardTitle>
          <CardDescription>Latest user registrations</CardDescription>
        </div>
        <Button variant="outline">View All Users</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.imageUrl || "/placeholder.svg"} />
                  <AvatarFallback>{user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{user.email}</span>
                    <span>•</span>
                    <span>{user.campaigns.length} campaigns</span>
                    <span>•</span>
                    <span>{user.instagramAccounts.length} accounts</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={user.subscriptionStatus === "active" ? "default" : "secondary"}>{user.planType}</Badge>
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
