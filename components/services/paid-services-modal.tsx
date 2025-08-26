
"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Heart, MessageCircle, Loader2, Instagram, Zap } from "lucide-react"

interface PaidServicesModalProps {
  accounts: any[]
  userId: string
  onClose: () => void
}

export function PaidServicesModal({ accounts, userId, onClose }: PaidServicesModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState("followers")
  const [formData, setFormData] = useState({
    accountId: "",
    quantity: "",
    postUrl: "",
  })

  const services = {
    followers: {
      name: "Followers",
      icon: Users,
      color: "text-blue-600",
      packages: [
        { quantity: 100, price: 2.99, delivery: "1-6 hours", quality: "High Quality" },
        { quantity: 500, price: 12.99, delivery: "1-12 hours", quality: "High Quality" },
        { quantity: 1000, price: 24.99, delivery: "1-24 hours", quality: "Premium" },
        { quantity: 2500, price: 59.99, delivery: "1-3 days", quality: "Premium" },
        { quantity: 5000, price: 109.99, delivery: "2-5 days", quality: "Premium" },
      ]
    },
    likes: {
      name: "Likes",
      icon: Heart,
      color: "text-red-600",
      packages: [
        { quantity: 100, price: 1.99, delivery: "5-30 mins", quality: "High Quality" },
        { quantity: 500, price: 7.99, delivery: "10-60 mins", quality: "High Quality" },
        { quantity: 1000, price: 14.99, delivery: "30-120 mins", quality: "Premium" },
        { quantity: 2500, price: 34.99, delivery: "1-6 hours", quality: "Premium" },
        { quantity: 5000, price: 64.99, delivery: "2-12 hours", quality: "Premium" },
      ]
    },
    comments: {
      name: "Comments",
      icon: MessageCircle,
      color: "text-green-600",
      packages: [
        { quantity: 10, price: 4.99, delivery: "1-6 hours", quality: "Custom" },
        { quantity: 25, price: 11.99, delivery: "2-12 hours", quality: "Custom" },
        { quantity: 50, price: 22.99, delivery: "6-24 hours", quality: "Custom" },
        { quantity: 100, price: 42.99, delivery: "12-48 hours", quality: "Custom" },
      ]
    }
  }

  const handlePurchase = async (packageData: any) => {
    if (!formData.accountId) {
      alert("Please select an Instagram account")
      return
    }

    if (selectedService !== "followers" && !formData.postUrl) {
      alert("Please enter the post URL")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/services/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          accountId: formData.accountId,
          serviceType: selectedService,
          quantity: packageData.quantity,
          price: packageData.price,
          postUrl: selectedService !== "followers" ? formData.postUrl : null,
        }),
      })

      if (response.ok) {
        alert(`Order placed successfully! Your ${selectedService} will be delivered within ${packageData.delivery}`)
        onClose()
      } else {
        alert("Failed to place order. Please try again.")
      }
    } catch (error) {
      console.error("Purchase failed:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const currentService = services[selectedService as keyof typeof services]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-accent" />
            <span>Boost Your Instagram</span>
          </DialogTitle>
          <DialogDescription>Get instant followers, likes, and comments to boost your Instagram presence</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Instagram Account</Label>
              <select
                className="w-full p-2 border border-border rounded-lg bg-background"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              >
                <option value="">Choose an account...</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    @{account.username} ({account.followersCount.toLocaleString()} followers)
                  </option>
                ))}
              </select>
            </div>

            {selectedService !== "followers" && (
              <div className="space-y-2">
                <Label>Post URL</Label>
                <Input
                  placeholder="https://instagram.com/p/..."
                  value={formData.postUrl}
                  onChange={(e) => setFormData({ ...formData, postUrl: e.target.value })}
                />
              </div>
            )}
          </div>

          <Tabs value={selectedService} onValueChange={setSelectedService} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="followers" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Followers</span>
              </TabsTrigger>
              <TabsTrigger value="likes" className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Likes</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Comments</span>
              </TabsTrigger>
            </TabsList>

            {Object.entries(services).map(([key, service]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {service.packages.map((pkg, index) => (
                    <Card key={index} className="relative overflow-hidden">
                      {index === 2 && (
                        <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                          Popular
                        </Badge>
                      )}
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center space-x-2">
                            <service.icon className={`w-5 h-5 ${service.color}`} />
                            <span>{pkg.quantity.toLocaleString()}</span>
                          </span>
                          <span className="text-2xl font-bold">${pkg.price}</span>
                        </CardTitle>
                        <CardDescription>
                          <div className="space-y-1 text-xs">
                            <div>⚡ {pkg.delivery}</div>
                            <div>✨ {pkg.quality}</div>
                            <div>🔒 Safe & Secure</div>
                            <div>📈 Instant Boost</div>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => handlePurchase(pkg)}
                          disabled={loading}
                          className="w-full bg-accent hover:bg-accent/90"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Buy ${pkg.quantity.toLocaleString()} ${service.name}`
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💳 Secure payments • 🔄 Money-back guarantee • 📞 24/7 support
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
