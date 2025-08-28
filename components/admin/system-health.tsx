import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Server, Database, Zap, AlertTriangle, RefreshCw, Users, Activity } from "lucide-react"
import { useState, useEffect } from "react"

interface SystemMetric {
  name: string
  value: string
  progress: number
  status: string
  icon: any
}

export function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemHealth()
    const interval = setInterval(fetchSystemHealth, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemHealth = async () => {
    try {
      // For now, we'll simulate system metrics
      // In a real implementation, these would come from actual monitoring APIs
      const simulatedMetrics = [
        { 
          name: "Database", 
          value: "Online", 
          progress: 100, 
          status: "healthy", 
          icon: Database 
        },
        { 
          name: "Bot Accounts", 
          value: "Active", 
          progress: 85, 
          status: "healthy", 
          icon: Users 
        },
        { 
          name: "API Status", 
          value: "Operational", 
          progress: 95, 
          status: "healthy", 
          icon: Zap 
        },
        { 
          name: "Order Queue", 
          value: "Processing", 
          progress: 70, 
          status: "warning", 
          icon: Activity 
        },
      ]

      setMetrics(simulatedMetrics)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch system health:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="animate-slide-in-right">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
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
        {metrics.map((metric, index) => (
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