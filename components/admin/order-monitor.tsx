
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react"

interface Order {
  id: string
  serviceType: string
  quantity: number
  delivered: number
  price: number
  status: string
  orderDate: string
  providerOrderId?: string
  providerId?: string
  user: {
    email: string
    firstName?: string
    lastName?: string
  }
  account: {
    username: string
  }
}

interface Provider {
  id: string
  name: string
  isActive: boolean
  isConnected: boolean
  lastError?: string
}

export function OrderMonitor() {
  const [orders, setOrders] = useState<Order[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch orders
      const ordersResponse = await fetch('/api/admin/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders)
        setStats(ordersData.stats)
      }

      // Fetch providers
      const providersResponse = await fetch('/api/admin/providers')
      if (providersResponse.ok) {
        const providersData = await providersResponse.json()
        setProviders(providersData.providers)
      }

    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const handleRetryOrders = async (orderIds: string[]) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry', orderIds })
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to retry orders:', error)
    }
  }

  const testProviderConnection = async (providerId: string) => {
    try {
      const response = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', providerId })
      })

      const result = await response.json()
      console.log('Connection test result:', result)
      await fetchData()
    } catch (error) {
      console.error('Failed to test connection:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([status, count]) => (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {status} Orders
              </CardTitle>
              {getStatusIcon(status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Order Management</h3>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 20).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.user.firstName} {order.user.lastName}</div>
                        <div className="text-sm text-muted-foreground">@{order.account.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium capitalize">{order.serviceType.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">${order.price}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.delivered.toLocaleString()} / {order.quantity.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((order.delivered / order.quantity) * 100)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.providerId || 'N/A'}
                      </div>
                      {order.providerOrderId && (
                        <div className="text-xs text-muted-foreground font-mono">
                          #{order.providerOrderId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.status === 'failed' && (
                        <Button
                          onClick={() => handleRetryOrders([order.id])}
                          variant="outline"
                          size="sm"
                        >
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Provider Status</h3>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <span>{provider.name}</span>
                      {provider.isConnected ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </CardTitle>
                    <Button
                      onClick={() => testProviderConnection(provider.id)}
                      variant="outline"
                      size="sm"
                    >
                      Test Connection
                    </Button>
                  </div>
                  <CardDescription>
                    Status: {provider.isConnected ? 'Connected' : 'Disconnected'}
                    {provider.lastError && (
                      <span className="text-red-500 block">Error: {provider.lastError}</span>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
