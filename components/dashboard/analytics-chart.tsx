"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsChartProps {
  userId: string
}

export function AnalyticsChart({ userId }: AnalyticsChartProps) {
  // Mock data - in real app, fetch from database
  const data = [
    { date: "2024-01-01", followers: 1200, engagement: 4.2 },
    { date: "2024-01-02", followers: 1250, engagement: 4.5 },
    { date: "2024-01-03", followers: 1180, engagement: 3.8 },
    { date: "2024-01-04", followers: 1320, engagement: 5.1 },
    { date: "2024-01-05", followers: 1380, engagement: 4.8 },
    { date: "2024-01-06", followers: 1420, engagement: 5.2 },
    { date: "2024-01-07", followers: 1480, engagement: 5.5 },
  ]

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl">Growth Analytics</CardTitle>
        <CardDescription>Track your follower growth and engagement over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
                dataKey="followers"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="hsl(var(--chart-2))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
