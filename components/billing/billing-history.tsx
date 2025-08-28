import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BillingHistoryProps {
  orders: Array<{
    id: string
    serviceType: string
    quantity: number
    price: number
    status: string
    orderDate: Date
    account: {
      username: string
    }
  }>
}

export function BillingHistory({ orders }: BillingHistoryProps) {
  const billingHistory = orders.slice(0, 10).map(order => ({
    id: order.id,
    date: order.orderDate.toISOString(),
    amount: order.price,
    status: order.status,
    service: `${order.quantity.toLocaleString()} ${order.serviceType}`,
    account: order.account.username,
  }))

  return (
    <Card className="animate-slide-in-right">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-accent" />
          <span>Billing History</span>
        </CardTitle>
        <CardDescription>Your payment history and invoices</CardDescription>
      </CardHeader>
      <CardContent>
        {billingHistory.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No billing history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {billingHistory.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-foreground">{invoice.service}</h3>
                    <Badge variant={
                      invoice.status === "completed" ? "default" : 
                      invoice.status === "processing" ? "secondary" : 
                      invoice.status === "failed" ? "destructive" : "outline"
                    }>
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{new Date(invoice.date).toLocaleDateString()}</span>
                    <span>${invoice.amount.toFixed(2)}</span>
                    <span>@{invoice.account}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Invoice
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
