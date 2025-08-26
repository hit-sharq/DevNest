import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Target, Activity } from "lucide-react"

interface StatsCardsProps {
  user: any
}

export function StatsCards({ user }: StatsCardsProps) {
  const totalFollowers = user.instagramAccounts.reduce((sum: number, account: any) => sum + account.followersCount, 0)

  const activeCampaigns = user.campaigns.filter((campaign: any) => campaign.status === "active").length

  const totalActions = user.campaigns.reduce(
    (sum: number, campaign: any) => sum + campaign.totalFollowsGained + campaign.totalLikes + campaign.totalComments,
    0,
  )

  const stats = [
    {
      title: "Total Followers",
      value: totalFollowers.toLocaleString(),
      change: "+12.5%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Growth Rate",
      value: "8.2%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns.toString(),
      change: `${user.campaigns.length} total`,
      icon: Target,
      color: "text-purple-600",
    },
    {
      title: "Total Actions",
      value: totalActions.toLocaleString(),
      change: "This month",
      icon: Activity,
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
