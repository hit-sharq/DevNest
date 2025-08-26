"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Calendar, Target, TrendingUp, Users, Heart, MessageCircle } from "lucide-react"

interface CampaignDetailsModalProps {
  campaign: any
  onClose: () => void
}

export function CampaignDetailsModal({ campaign, onClose }: CampaignDetailsModalProps) {
  // Mock analytics data - in real app, fetch from database
  const analyticsData = [
    { date: "2024-01-01", follows: 12, likes: 45, comments: 8 },
    { date: "2024-01-02", follows: 15, likes: 52, comments: 12 },
    { date: "2024-01-03", follows: 8, likes: 38, comments: 6 },
    { date: "2024-01-04", follows: 18, likes: 67, comments: 15 },
    { date: "2024-01-05", follows: 22, likes: 73, comments: 18 },
    { date: "2024-01-06", follows: 16, likes: 58, comments: 11 },
    { date: "2024-01-07", follows: 20, likes: 65, comments: 14 },
  ]

  const recentActions = campaign.actions?.slice(0, 10) || []

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{campaign.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {campaign.description || `Targeting: ${campaign.targetValue}`}
              </DialogDescription>
            </div>
            <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="text-sm">
              {campaign.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="actions">Recent Actions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Follows Gained</CardTitle>
                  <Users className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaign.totalFollowsGained}</div>
                  <p className="text-xs text-muted-foreground">+12% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Likes Given</CardTitle>
                  <Heart className="w-4 h-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaign.totalLikes}</div>
                  <p className="text-xs text-muted-foreground">+8% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comments Made</CardTitle>
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaign.totalComments}</div>
                  <p className="text-xs text-muted-foreground">+15% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unfollows</CardTitle>
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaign.totalUnfollows}</div>
                  <p className="text-xs text-muted-foreground">Automated cleanup</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Campaign Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Type:</span>
                    <span className="font-medium capitalize">{campaign.targetType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Value:</span>
                    <span className="font-medium">{campaign.targetValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instagram Account:</span>
                    <span className="font-medium">@{campaign.account?.username || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Daily Limits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Follow Limit:</span>
                    <span className="font-medium">{campaign.dailyFollowLimit}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unfollow Limit:</span>
                    <span className="font-medium">{campaign.dailyUnfollowLimit}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Like Limit:</span>
                    <span className="font-medium">{campaign.dailyLikeLimit}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comment Limit:</span>
                    <span className="font-medium">{campaign.dailyCommentLimit}/day</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Daily activity over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        className="text-muted-foreground"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="follows"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="likes"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="comments"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Actions</CardTitle>
                <CardDescription>Latest campaign activities</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent actions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActions.map((action: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="capitalize">
                            {action.actionType}
                          </Badge>
                          <span className="font-medium">@{action.targetUser}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={action.success ? "default" : "destructive"}>
                            {action.success ? "Success" : "Failed"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(action.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Settings</CardTitle>
                <CardDescription>Modify campaign parameters and limits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Campaign settings editing will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
