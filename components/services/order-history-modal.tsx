
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Users, Heart, MessageCircle, Eye, Play } from "lucide-react"

interface OrderHistoryModalProps {
  userId: string
  onClose: () => void
}

interface Order {
  id: string
  serviceType: string
  quantity: number
  delivered: number
  price: number
  status: string
  orderDate: string
  completedAt?: string
  postUrl?: string
  account: {
    username: string
  }
}

export function OrderHistoryModal({ userId, onClose }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/services/orders?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "followers": return <Users className="w-4 h-4" />
      case "likes": return <Heart className="w-4 h-4" />
      case "comments": return <MessageCircle className="w-4 h-4" />
      case "views": return <Eye className="w-4 h-4" />
      case "story_views": return <Play className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getProgress = (delivered: number, quantity: number) => {
    return Math.min((delivered / quantity) * 100, 100)
  }

  const activeOrders = orders.filter(order => order.status === "processing" || order.status === "pending")
  const completedOrders = orders.filter(order => order.status === "completed")
  const allOrders = orders

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order History & Tracking</DialogTitle>
          <DialogDescription>Monitor your service orders and delivery progress</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
            <TabsTrigger value="all">All Orders ({allOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active orders</p>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        {getServiceIcon(order.serviceType)}
                        <span className="capitalize">{order.serviceType.replace('_', ' ')}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          for @{order.account.username}
                        </span>
                      </CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <CardDescription>
                      Order #{order.id.slice(-8)} • ${order.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress: {order.delivered.toLocaleString()} / {order.quantity.toLocaleString()}</span>
                        <span>{Math.round(getProgress(order.delivered, order.quantity))}%</span>
                      </div>
                      <Progress value={getProgress(order.delivered, order.quantity)} className="h-2" />
                      {order.postUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={order.postUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Post
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed orders yet</p>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        {getServiceIcon(order.serviceType)}
                        <span className="capitalize">{order.serviceType.replace('_', ' ')}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          for @{order.account.username}
                        </span>
                      </CardTitle>
                      {getStatusBadge(order.status)}
                    </div>
                    <CardDescription>
                      Order #{order.id.slice(-8)} • ${order.price} • Completed {new Date(order.completedAt!).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span>Delivered: {order.delivered.toLocaleString()} / {order.quantity.toLocaleString()}</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    {order.postUrl && (
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <a href={order.postUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Post
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {allOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getServiceIcon(order.serviceType)}
                      <span className="capitalize">{order.serviceType.replace('_', ' ')}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        for @{order.account.username}
                      </span>
                    </CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <CardDescription>
                    Order #{order.id.slice(-8)} • ${order.price} • {new Date(order.orderDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress: {order.delivered.toLocaleString()} / {order.quantity.toLocaleString()}</span>
                      <span>{Math.round(getProgress(order.delivered, order.quantity))}%</span>
                    </div>
                    {order.status === "processing" && (
                      <Progress value={getProgress(order.delivered, order.quantity)} className="h-2" />
                    )}
                    {order.postUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={order.postUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Post
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
