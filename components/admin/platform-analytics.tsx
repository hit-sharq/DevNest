"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export function PlatformAnalytics() {
  // Mock data - in real app, fetch from database
  const userGrowthData = [
    { date: "2024-01-01", users: 120, revenue: 9480 },
    { date: "2024-01-02", users: 135, revenue: 10665 },
    { date: "2024-01-03", users: 148, revenue: 11692 },
    { date: "2024-01-04", users: 162, revenue: 12798 },
    { date: "2024-01-05", users: 178, revenue: 14062 },
    { date: "2024-01-06", users: 195, revenue: 15405 },
    { date: "2024-01-07", users: 212, revenue: 16748 },
  ]

  const planDistribution = [
    { plan: "Free", users: 450, percentage: 65 },
    { plan: "Basic", users: 120, percentage: 17 },
    { plan: "Pro", users: 95, percentage: 14 },
    { plan: "Enterprise", users: 28, percentage: 4 },
  ]

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
          <CardDescription>User growth and revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
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
          </div>
        </CardContent>
      </Card>

      <Card className="animate-slide-in-right">
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>User distribution across subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planDistribution}>
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
                <Bar dataKey="users" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
