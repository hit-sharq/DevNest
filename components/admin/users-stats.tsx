import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Crown } from "lucide-react"

interface UsersStatsProps {
  users: any[]
}

export function UsersStats({ users }: UsersStatsProps) {
  const totalUsers = users.length
  const activeSubscriptions = users.filter((u) => u.subscriptionStatus === "active").length
  const freeUsers = users.filter((u) => u.planType === "free").length
  const adminUsers = users.filter((u) => u.role === "admin" || u.role === "super_admin").length

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.toLocaleString(),
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "Free Users",
      value: freeUsers.toLocaleString(),
      icon: UserX,
      color: "text-orange-600",
    },
    {
      title: "Admin Users",
      value: adminUsers.toLocaleString(),
      icon: Crown,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in-right">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
