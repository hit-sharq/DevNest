"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Smartphone, Loader2 } from "lucide-react"

interface PaymentModalProps {
  plan: {
    id: string
    name: string
    price: number
    description: string
  }
  user: any
  onClose: () => void
}

export function PaymentModal({ plan, user, onClose }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("paypal")
  const [mpesaPhone, setMpesaPhone] = useState("")

  const handlePayPalPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payments/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
          userId: user.id,
        }),
      })

      const { approvalUrl } = await response.json()
      window.location.href = approvalUrl
    } catch (error) {
      console.error("PayPal payment error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMpesaPayment = async () => {
    if (!mpesaPhone) return

    setLoading(true)
    try {
      const response = await fetch("/api/payments/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
          phoneNumber: mpesaPhone,
          userId: user.id,
        }),
      })

      const result = await response.json()
      if (result.success) {
        alert("Payment request sent to your phone. Please complete the transaction.")
        onClose()
      }
    } catch (error) {
      console.error("M-Pesa payment error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            You're upgrading to {plan.name} plan for ${plan.price}/month
          </DialogDescription>
        </DialogHeader>

        <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paypal" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>PayPal</span>
            </TabsTrigger>
            <TabsTrigger value="mpesa" className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>M-Pesa</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paypal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PayPal Payment</CardTitle>
                <CardDescription>Secure payment with PayPal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">{plan.name} Plan</span>
                    <span className="font-bold">${plan.price}/month</span>
                  </div>
                  <Button
                    onClick={handlePayPalPayment}
                    disabled={loading}
                    className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Pay with PayPal"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mpesa" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">M-Pesa Payment</CardTitle>
                <CardDescription>Pay with your mobile money</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="254712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">{plan.name} Plan</span>
                    <span className="font-bold">KSh {Math.round(plan.price * 130)}</span>
                  </div>
                  <Button
                    onClick={handleMpesaPayment}
                    disabled={loading || !mpesaPhone}
                    className="w-full bg-[#00a86b] hover:bg-[#008f5a] text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Pay with M-Pesa"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
