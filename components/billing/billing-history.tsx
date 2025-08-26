import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BillingHistoryProps {
  user: any
}

export function BillingHistory({ user }: BillingHistoryProps) {
  // Mock billing history - in real app, fetch from database
  const billingHistory = [
    {
      id: "inv_001",
      date: "2024-01-01",
      amount: 79,
      status: "paid",
      plan: "Pro Plan",
      method: "PayPal",
    },
    {
      id: "inv_002",
      date: "2023-12-01",
      amount: 79,
      status: "paid",
      plan: "Pro Plan",
      method: "M-Pesa",
    },
    {
      id: "inv_003",
      date: "2023-11-01",
      amount: 29,
      status: "paid",
      plan: "Basic Plan",
      method: "PayPal",
    },
  ]

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
                    <h3 className="font-semibold text-foreground">{invoice.plan}</h3>
                    <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>{invoice.status}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{new Date(invoice.date).toLocaleDateString()}</span>
                    <span>${invoice.amount}</span>
                    <span>{invoice.method}</span>
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
