
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface CampaignAnalyticsProps {
  campaigns: Array<{
    id: string
    name: string
    status: string
    totalFollowsGained: number
    totalLikes: number
    totalComments: number
    dailyFollowLimit: number
    createdAt: Date
  }>
}

export function CampaignAnalytics({ campaigns }: CampaignAnalyticsProps) {
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const totalGains = campaigns.reduce((sum, c) => sum + c.totalFollowsGained, 0)
  const totalLikes = campaigns.reduce((sum, c) => sum + c.totalLikes, 0)
  const totalComments = campaigns.reduce((sum, c) => sum + c.totalComments, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
        <CardDescription>
          {campaigns.length} campaigns | {activeCampaigns.length} active
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">+{totalGains}</div>
            <div className="text-xs text-muted-foreground">Follows Gained</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalLikes}</div>
            <div className="text-xs text-muted-foreground">Likes Given</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalComments}</div>
            <div className="text-xs text-muted-foreground">Comments</div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Active Campaigns</h4>
          {activeCampaigns.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No active campaigns
            </div>
          ) : (
            activeCampaigns.slice(0, 3).map((campaign) => (
              <div key={campaign.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{campaign.name}</span>
                  <Badge variant="outline">{campaign.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  +{campaign.totalFollowsGained} followers gained
                </div>
                <Progress 
                  value={Math.min((campaign.totalFollowsGained / 100) * 100, 100)} 
                  className="h-1" 
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
