import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, MoreHorizontal } from "lucide-react"

interface CampaignsListProps {
  campaigns: any[]
}

export function CampaignsList({ campaigns }: CampaignsListProps) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Active Campaigns</CardTitle>
          <CardDescription>Manage your Instagram growth campaigns</CardDescription>
        </div>
        <Button className="bg-accent hover:bg-accent/90">Create Campaign</Button>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No campaigns yet</p>
            <Button className="bg-accent hover:bg-accent/90">Create Your First Campaign</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                    <Badge variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {campaign.description || `Targeting: ${campaign.targetValue}`}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Follows: {campaign.totalFollowsGained}</span>
                    <span>Likes: {campaign.totalLikes}</span>
                    <span>Comments: {campaign.totalComments}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    {campaign.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
