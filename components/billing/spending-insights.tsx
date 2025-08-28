
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface SpendingInsightsProps {
  data: {
    topService: [string, number] | undefined
    monthlyTrend: {
      current: number
      last: number
      trend: number
    }
    costPerFollower: number
  }
}

export function SpendingInsights({ data }: SpendingInsightsProps) {
  const { topService, monthlyTrend, costPerFollower } = data
  const isPositiveTrend = monthlyTrend.trend > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
        <CardDescription>Analysis of your purchasing patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {topService && (
          <div>
            <h4 className="font-medium mb-2">Top Service</h4>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="capitalize">{topService[0]}</span>
              <Badge variant="secondary">${topService[1].toFixed(2)}</Badge>
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2">Monthly Trend</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-medium">${monthlyTrend.current.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Month</span>
              <span className="font-medium">${monthlyTrend.last.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Change</span>
              <div className="flex items-center space-x-1">
                {isPositiveTrend ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
                <span className={`font-medium ${isPositiveTrend ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.abs(monthlyTrend.trend).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {costPerFollower > 0 && (
          <div>
            <h4 className="font-medium mb-2">Cost Per Follower</h4>
            <div className="text-2xl font-bold text-blue-600">
              ${costPerFollower.toFixed(3)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average cost based on follower purchases
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
