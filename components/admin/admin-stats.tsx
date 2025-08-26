import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, DollarSign, TrendingUp } from "lucide-react"

interface AdminStatsProps {
  totalUsers: number
  totalCampaigns: number
  activeSubscriptions: number
}

export function AdminStats({ totalUsers, totalCampaigns, activeSubscriptions }: AdminStatsProps) {
  const monthlyRevenue = activeSubscriptions * 79 // Assuming average of $79/month

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      change: "+12% from last month",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Campaigns",
      value: totalCampaigns.toLocaleString(),
      change: "+8% from last month",
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.toLocaleString(),
      change: "+15% from last month",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Monthly Revenue",
      value: `$${monthlyRevenue.toLocaleString()}`,
      change: "+22% from last month",
      icon: DollarSign,
      color: "text-orange-600",
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
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
