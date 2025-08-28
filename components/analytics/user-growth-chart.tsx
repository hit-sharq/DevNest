
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface UserGrowthChartProps {
  data: Array<{
    date: string
    followers: number
    gained: number
    lost: number
  }>
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Follower Growth Trend</CardTitle>
        <CardDescription>Your Instagram growth over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name === 'followers' ? 'Total Followers' : 
                name === 'gained' ? 'Gained' : 'Lost'
              ]}
            />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#growthGradient)"
            />
            <Line type="monotone" dataKey="gained" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
