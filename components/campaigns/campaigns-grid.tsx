"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, Pause, Settings, BarChart3, Trash2, Target } from "lucide-react"
import { CreateCampaignModal } from "./create-campaign-modal"
import { CampaignDetailsModal } from "./campaign-details-modal"

interface CampaignsGridProps {
  campaigns: any[]
  accounts: any[]
  userId: string
}

export function CampaignsGrid({ campaigns, accounts, userId }: CampaignsGridProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const handleToggleCampaign = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active"

    try {
      await fetch(`/api/campaigns/${campaignId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error("Failed to toggle campaign:", error)
    }
  }

  const handleViewDetails = (campaign: any) => {
    setSelectedCampaign(campaign)
    setShowDetailsModal(true)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Campaigns</h2>
          <Button onClick={() => setShowCreateModal(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <Card className="animate-fade-in-up">
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-6">Create your first campaign to start growing your Instagram</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="hover:shadow-lg transition-all duration-300 border-border/50 animate-fade-in-up"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {campaign.description || `Targeting: ${campaign.targetValue}`}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Follows</p>
                      <p className="font-semibold text-foreground">{campaign.totalFollowsGained}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Likes</p>
                      <p className="font-semibold text-foreground">{campaign.totalLikes}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Comments</p>
                      <p className="font-semibold text-foreground">{campaign.totalComments}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account</p>
                      <p className="font-semibold text-foreground">@{campaign.account?.username || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                    >
                      {campaign.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(campaign)}>
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateCampaignModal accounts={accounts} userId={userId} onClose={() => setShowCreateModal(false)} />
      )}

      {showDetailsModal && selectedCampaign && (
        <CampaignDetailsModal campaign={selectedCampaign} onClose={() => setShowDetailsModal(false)} />
      )}
    </>
  )
}
