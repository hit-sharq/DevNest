import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Play, Pause, TrendingUp } from "lucide-react"

interface CampaignStatsProps {
  campaigns: any[]
}

export function CampaignStats({ campaigns }: CampaignStatsProps) {
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length
  const pausedCampaigns = campaigns.filter((c) => c.status === "paused").length
  const totalFollowsGained = campaigns.reduce((sum, c) => sum + c.totalFollowsGained, 0)
  const totalActions = campaigns.reduce((sum, c) => sum + c.totalLikes + c.totalComments + c.totalFollowsGained, 0)

  const stats = [
    {
      title: "Active Campaigns",
      value: activeCampaigns.toString(),
      icon: Play,
      color: "text-green-600",
    },
    {
      title: "Paused Campaigns",
      value: pausedCampaigns.toString(),
      icon: Pause,
      color: "text-orange-600",
    },
    {
      title: "Total Follows Gained",
      value: totalFollowsGained.toLocaleString(),
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Total Actions",
      value: totalActions.toLocaleString(),
      icon: Target,
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
