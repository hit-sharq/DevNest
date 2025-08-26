
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Bot, Users, Shield, Activity } from "lucide-react"

export function BotAccountsManagement() {
  const [accounts, setAccounts] = useState([])
  const [stats, setStats] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    accountType: 'dedicated'
  })

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/bot-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Bot account added successfully!')
        setFormData({ username: '', password: '', accountType: 'dedicated' })
        setShowAddForm(false)
        // Refresh data
        loadData()
      }
    } catch (error) {
      alert('Failed to add bot account')
    }
  }

  const loadData = async () => {
    try {
      const [accountsRes, statsRes] = await Promise.all([
        fetch('/api/admin/bot-accounts'),
        fetch('/api/admin/bot-accounts/stats')
      ])
      
      const accountsData = await accountsRes.json()
      const statsData = await statsRes.json()
      
      setAccounts(accountsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
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
                    {stats.accountsByType?.find(t => t.accountType === 'dedicated')?._count?.id || 0}
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
                    {stats.accountsByType?.find(t => t.accountType === 'user_contributed')?._count?.id || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">User Contributed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
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

          <div className="space-y-3">
            {accounts.map((account: any) => (
              <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">@{account.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.dailyActionsUsed}/{account.dailyActionLimit} actions used today
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={account.accountType === 'dedicated' ? 'default' : 'secondary'}>
                    {account.accountType}
                  </Badge>
                  <Badge variant={account.isActive ? 'default' : 'destructive'}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
