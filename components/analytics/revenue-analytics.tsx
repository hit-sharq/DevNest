
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueAnalyticsProps {
  data: {
    daily: Array<{ date: string; amount: number }>
    total: number
    average: number
  }
}

export function RevenueAnalytics({ data }: RevenueAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Analytics</CardTitle>
        <CardDescription>
          Total: ${data.total.toFixed(2)} | Avg per order: ${data.average.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount Spent']}
            />
            <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
