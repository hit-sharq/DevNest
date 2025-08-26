"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Hash, MapPin, Users, Loader2 } from "lucide-react"

interface CreateCampaignModalProps {
  accounts: any[]
  userId: string
  onClose: () => void
}

export function CreateCampaignModal({ accounts, userId, onClose }: CreateCampaignModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    accountId: "",
    targetType: "hashtag",
    targetValue: "",
    dailyFollowLimit: [50],
    dailyUnfollowLimit: [30],
    dailyLikeLimit: [100],
    dailyCommentLimit: [20],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dailyFollowLimit: formData.dailyFollowLimit[0],
          dailyUnfollowLimit: formData.dailyUnfollowLimit[0],
          dailyLikeLimit: formData.dailyLikeLimit[0],
          dailyCommentLimit: formData.dailyCommentLimit[0],
          userId,
        }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to create campaign:", error)
    } finally {
      setLoading(false)
    }
  }

  const targetTypes = [
    { value: "hashtag", label: "Hashtag", icon: Hash, description: "Target users who use specific hashtags" },
    { value: "location", label: "Location", icon: MapPin, description: "Target users from specific locations" },
    { value: "competitor", label: "Competitor", icon: Users, description: "Target followers of competitor accounts" },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>Set up a new Instagram growth campaign with custom targeting</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="targeting">Targeting</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Fitness Hashtag Campaign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your campaign goals and strategy"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Instagram Account</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an Instagram account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        @{account.username} ({account.followersCount.toLocaleString()} followers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="targeting" className="space-y-4">
              <div className="space-y-4">
                <Label>Target Type</Label>
                <div className="grid gap-3">
                  {targetTypes.map((type) => (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all ${
                        formData.targetType === type.value ? "border-accent bg-accent/5" : "hover:bg-muted/20"
                      }`}
                      onClick={() => setFormData({ ...formData, targetType: type.value })}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </CardTitle>
                        <CardDescription className="text-xs">{type.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetValue">
                  {formData.targetType === "hashtag" && "Hashtag (without #)"}
                  {formData.targetType === "location" && "Location Name"}
                  {formData.targetType === "competitor" && "Competitor Username (without @)"}
                </Label>
                <Input
                  id="targetValue"
                  placeholder={
                    formData.targetType === "hashtag"
                      ? "fitness"
                      : formData.targetType === "location"
                        ? "New York"
                        : "competitor_username"
                  }
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Daily Follow Limit: {formData.dailyFollowLimit[0]}</Label>
                  <Slider
                    value={formData.dailyFollowLimit}
                    onValueChange={(value) => setFormData({ ...formData, dailyFollowLimit: value })}
                    max={200}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 30-80 per day for safety</p>
                </div>

                <div className="space-y-3">
                  <Label>Daily Unfollow Limit: {formData.dailyUnfollowLimit[0]}</Label>
                  <Slider
                    value={formData.dailyUnfollowLimit}
                    onValueChange={(value) => setFormData({ ...formData, dailyUnfollowLimit: value })}
                    max={150}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Daily Like Limit: {formData.dailyLikeLimit[0]}</Label>
                  <Slider
                    value={formData.dailyLikeLimit}
                    onValueChange={(value) => setFormData({ ...formData, dailyLikeLimit: value })}
                    max={500}
                    min={20}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Daily Comment Limit: {formData.dailyCommentLimit[0]}</Label>
                  <Slider
                    value={formData.dailyCommentLimit}
                    onValueChange={(value) => setFormData({ ...formData, dailyCommentLimit: value })}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.accountId || !formData.targetValue}
              className="bg-accent hover:bg-accent/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Campaign"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
