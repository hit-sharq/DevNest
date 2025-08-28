"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface PlatformData {
  userGrowthData: Array<{
    date: string
    users: number
    revenue: number
  }>
  planDistribution: Array<{
    plan: string
    users: number
    percentage: number
  }>
}

export function PlatformAnalytics() {
  const [data, setData] = useState<PlatformData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlatformAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/platform-analytics')
        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error('Failed to fetch platform analytics:', error)
        // Fallback to empty data
        setData({
          userGrowthData: [],
          planDistribution: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPlatformAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>User growth and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Skeleton className="w-full h-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>User distribution across subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Skeleton className="w-full h-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
          <CardDescription>User growth and revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {data && data.userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.userGrowthData}>
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
                    dataKey="users"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No growth data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>User distribution across subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {data && data.planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.planDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="plan" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="users" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No plan distribution data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}