
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Smartphone, Plus } from "lucide-react"

export function PaymentMethods() {
  // Mock payment methods - replace with real data
  const paymentMethods = [
    {
      id: "pm_1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      isDefault: true,
    },
    {
      id: "pm_2",
      type: "mpesa",
      phone: "+254700000000",
      isDefault: false,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Manage your payment options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {method.type === 'card' ? (
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Smartphone className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <div className="font-medium">
                  {method.type === 'card' 
                    ? `${method.brand} ****${method.last4}`
                    : method.phone
                  }
                </div>
                {method.isDefault && (
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </CardContent>
    </Card>
  )
}
