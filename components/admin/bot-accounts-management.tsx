"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Bot, Users, Shield, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface BotAccountStats {
  totalAccounts: number
  totalActionsToday: number
  accountsByType: Array<{
    accountType: string
    _count: { id: number }
  }>
}

interface BotAccount {
  id: string
  username: string
  dailyActionsUsed: number
  dailyActionLimit: number
  accountType: string
  isActive: boolean
}

export function BotAccountsManagement() {
  const [accounts, setAccounts] = useState<BotAccount[]>([])
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<BotAccountStats | null>(null) // Changed to BotAccountStats for type safety
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    accountType: "dedicated",
  })

  useEffect(() => {
    fetchAccounts()
    fetchStats()
  }, [statusFilter])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const response = await fetch(`/api/admin/bot-accounts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAccounts(data) // Assuming data is the array of accounts
      } else {
        // Handle non-ok responses, e.g., 403 Forbidden, 404 Not Found
        console.error("Failed to fetch accounts:", response.status, response.statusText)
        setAccounts([]) // Clear accounts on error
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
      setAccounts([]) // Clear accounts on error
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/bot-accounts/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data) // Assuming data is the stats object
      } else {
        console.error("Failed to fetch stats:", response.status, response.statusText)
        setStats(null) // Clear stats on error
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats(null) // Clear stats on error
    }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/bot-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Bot account added successfully!")
        setFormData({ username: "", password: "", accountType: "dedicated" })
        setShowAddForm(false)
        // Refresh data
        fetchAccounts()
        fetchStats() // Also refresh stats if adding an account affects them
      } else {
        alert(`Failed to add bot account: ${response.statusText}`)
      }
    } catch (error) {
      alert("Failed to add bot account")
    }
  }

  const handleBulkAction = async (action: string, status?: string) => {
    if (selectedAccounts.length === 0) return

    try {
      const response = await fetch('/api/admin/bot-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          accountIds: selectedAccounts,
          status
        })
      })

      if (response.ok) {
        fetchAccounts()
        fetchStats()
        setSelectedAccounts([])
      } else {
        alert(`Bulk action failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Bulk action failed.')
    }
  }

  const handleSelectAccount = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId) ? prev.filter(id => id !== accountId) : [...prev, accountId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAccounts.length === accounts.length) {
      setSelectedAccounts([])
    } else {
      setSelectedAccounts(accounts.map(acc => acc.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-2" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">{stats.totalAccounts}</p>
                  <p className="text-xs text-muted-foreground">Active Bot Accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">{stats.totalActionsToday}</p>
                  <p className="text-xs text-muted-foreground">Actions Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">
                    {stats.accountsByType?.find((t: { accountType: string }) => t.accountType === "dedicated")?._count
                      ?.id || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Dedicated Bots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-2xl font-bold">
                    {stats.accountsByType?.find((t: { accountType: string }) => t.accountType === "user_contributed")
                      ?._count?.id || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">User Contributed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent>
            <p className="text-center text-muted-foreground">Could not load statistics.</p>
          </CardContent>
        </Card>
      )}

      {/* Bot Accounts List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bot Accounts</CardTitle>
              <CardDescription>Manage bot accounts for automated actions</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Bot Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleAddAccount} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Instagram Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Add Account</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {loading && accounts.length === 0 && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && accounts.length === 0 && (
            <div className="text-center text-muted-foreground py-4">No bot accounts found.</div>
          )}

          {!loading && accounts.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                  {selectedAccounts.length > 0 && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>Activate</Button>
                      <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>Deactivate</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleBulkAction('ban')}>Ban</Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {accounts.map((account: BotAccount) => (
                  <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(account.id)}
                        onChange={() => handleSelectAccount(account.id)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <Bot className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">@{account.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.dailyActionsUsed}/{account.dailyActionLimit} actions used today
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={account.accountType === "dedicated" ? "default" : "secondary"}>
                        {account.accountType}
                      </Badge>
                      <Badge variant={account.isActive ? "default" : "destructive"}>
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}