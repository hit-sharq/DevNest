
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface UsageAnalyticsProps {
  data: {
    totalSpent: number
    totalOrders: number
    averageOrder: number
    ordersByService: Record<string, number>
    dailySpending: Array<{ date: string; amount: number }>
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function UsageAnalytics({ data }: UsageAnalyticsProps) {
  const serviceData = Object.entries(data.ordersByService).map(([service, count], index) => ({
    name: service,
    value: count,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Spending</CardTitle>
          <CardDescription>Your spending pattern over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.dailySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Usage</CardTitle>
          <CardDescription>Breakdown by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{data.totalOrders}</div>
                <div className="text-xs text-muted-foreground">Total Orders</div>
              </div>
              <div>
                <div className="text-2xl font-bold">${data.totalSpent.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Total Spent</div>
              </div>
              <div>
                <div className="text-2xl font-bold">${data.averageOrder.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Avg Order</div>
              </div>
            </div>

            <div className="space-y-2">
              {serviceData.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: service.color }}
                    />
                    <span className="capitalize text-sm">{service.name}</span>
                  </div>
                  <span className="font-medium">{service.value} orders</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
