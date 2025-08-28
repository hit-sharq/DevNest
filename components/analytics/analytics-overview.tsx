
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, ShoppingCart, Target, Users, Play } from "lucide-react"

interface AnalyticsOverviewProps {
  data: {
    totalSpent: number
    totalOrders: number
    activeServices: number
    recentGrowth: number
    totalCampaigns: number
    activeCampaigns: number
  }
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const cards = [
    {
      title: "Total Spent",
      value: `$${data.totalSpent.toFixed(2)}`,
      description: "Lifetime spending",
      icon: DollarSign,
      trend: "+12.5%",
    },
    {
      title: "Total Orders",
      value: data.totalOrders.toString(),
      description: "Services purchased",
      icon: ShoppingCart,
      trend: "+8.2%",
    },
    {
      title: "Active Services",
      value: data.activeServices.toString(),
      description: "Currently processing",
      icon: Play,
      trend: data.activeServices > 0 ? "Active" : "None",
    },
    {
      title: "Recent Growth",
      value: `+${data.recentGrowth}`,
      description: "Followers this week",
      icon: TrendingUp,
      trend: "+15.3%",
    },
    {
      title: "Total Campaigns",
      value: data.totalCampaigns.toString(),
      description: "Automation campaigns",
      icon: Target,
      trend: `${data.activeCampaigns} active`,
    },
    {
      title: "Growth Rate",
      value: `${((data.recentGrowth / 7) * 100).toFixed(1)}%`,
      description: "Daily average",
      icon: Users,
      trend: "Improving",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
      {cards.map((card, index) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{card.description}</p>
              <span className="text-xs text-green-600 font-medium">{card.trend}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
