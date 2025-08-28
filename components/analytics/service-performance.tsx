
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface ServicePerformanceProps {
  data: Array<{
    type: string
    orders: number
    spent: number
    quantity: number
    delivered: number
    completionRate: number
  }>
}

export function ServicePerformance({ data }: ServicePerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Performance</CardTitle>
        <CardDescription>Breakdown by service type</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((service) => (
          <div key={service.type} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium capitalize">{service.type}</h3>
                <Badge variant="secondary">{service.orders} orders</Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                ${service.spent.toFixed(2)}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{service.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={service.completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>Ordered: {service.quantity.toLocaleString()}</div>
              <div>Delivered: {service.delivered.toLocaleString()}</div>
            </div>
          </div>
        ))}
        
        {data.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No services purchased yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}
