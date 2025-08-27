"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bot, Plus, Settings, Zap } from "lucide-react"

interface CreatedAccount {
  id: string
  username: string
  email: string
  createdAt: string
  isActive: boolean
  accountType: string
}

export function AccountCreation() {
  const [loading, setLoading] = useState(false)
  const [batchCount, setBatchCount] = useState(5)
  const [scheduledEnabled, setScheduledEnabled] = useState(false)
  const [accountsPerDay, setAccountsPerDay] = useState(10)
  const [stats, setStats] = useState<{
    totalAccounts: number
    recentAccounts: CreatedAccount[]
  } | null>(null)

  const handleCreateBatch = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/create-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: batchCount, scheduled: false }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        await loadStats()
      } else {
        alert("Failed to start account creation")
      }
    } catch (error) {
      alert("Error starting account creation")
    } finally {
      setLoading(false)
    }
  }

  const handleScheduledCreation = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/create-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: accountsPerDay, scheduled: true }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        setScheduledEnabled(true)
      } else {
        alert("Failed to start scheduled creation")
      }
    } catch (error) {
      alert("Error starting scheduled creation")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/create-accounts")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  // Load stats on component mount
  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span>Automatic Account Creation</span>
        </h3>
        <p className="text-sm text-muted-foreground">Automatically create Instagram accounts for your bot pool</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Batch Creation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Batch Creation</span>
            </CardTitle>
            <CardDescription>Create multiple accounts immediately</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchCount">Number of Accounts</Label>
              <Input
                id="batchCount"
                type="number"
                min="1"
                max="20"
                value={batchCount}
                onChange={(e) => setBatchCount(Number.parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">Maximum 20 accounts per batch</p>
            </div>

            <Button onClick={handleCreateBatch} disabled={loading} className="w-full">
              {loading ? "Creating..." : `Create ${batchCount} Accounts`}
            </Button>
          </CardContent>
        </Card>

        {/* Scheduled Creation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Scheduled Creation</span>
            </CardTitle>
            <CardDescription>Automatically create accounts daily</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="scheduled">Enable Scheduled Creation</Label>
              <Switch id="scheduled" checked={scheduledEnabled} onCheckedChange={setScheduledEnabled} />
            </div>

            {scheduledEnabled && (
              <div className="space-y-2">
                <Label htmlFor="accountsPerDay">Accounts Per Day</Label>
                <Input
                  id="accountsPerDay"
                  type="number"
                  min="1"
                  max="50"
                  value={accountsPerDay}
                  onChange={(e) => setAccountsPerDay(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            <Button
              onClick={handleScheduledCreation}
              disabled={loading || !scheduledEnabled}
              variant={scheduledEnabled ? "default" : "secondary"}
              className="w-full"
            >
              {loading ? "Setting up..." : "Start Scheduled Creation"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Creation Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalAccounts}</div>
                  <p className="text-sm text-muted-foreground">Total Created</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.recentAccounts.filter((a) => a.isActive).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.recentAccounts.length}</div>
                  <p className="text-sm text-muted-foreground">Recent</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recent Accounts</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats.recentAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">@{account.username}</span>
                        <p className="text-xs text-muted-foreground">{account.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={account.isActive ? "default" : "secondary"}>
                          {account.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{account.accountType}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">Loading statistics...</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
