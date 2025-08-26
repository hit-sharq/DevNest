import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Server, Database, Zap, AlertTriangle } from "lucide-react"

export function SystemHealth() {
  const systemMetrics = [
    {
      name: "API Response Time",
      value: "245ms",
      status: "good",
      progress: 85,
      icon: Zap,
    },
    {
      name: "Database Performance",
      value: "98.5%",
      status: "excellent",
      progress: 98,
      icon: Database,
    },
    {
      name: "Server Uptime",
      value: "99.9%",
      status: "excellent",
      progress: 99,
      icon: Server,
    },
    {
      name: "Error Rate",
      value: "0.1%",
      status: "good",
      progress: 10,
      icon: AlertTriangle,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="animate-slide-in-right">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-accent" />
          <span>System Health</span>
        </CardTitle>
        <CardDescription>Real-time platform monitoring</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {systemMetrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{metric.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold">{metric.value}</span>
                <Badge variant="outline" className={`${getStatusColor(metric.status)} text-white border-0`}>
                  {metric.status}
                </Badge>
              </div>
            </div>
            <Progress value={metric.progress} className="h-2" />
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last updated:</span>
            <span className="font-medium">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
