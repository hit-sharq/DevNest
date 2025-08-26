
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Instagram, Loader2 } from "lucide-react"

interface ConnectAccountModalProps {
  userId: string
  onClose: () => void
  onAccountAdded: () => void
}

export function ConnectAccountModal({ userId, onClose, onAccountAdded }: ConnectAccountModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username.trim()) {
      alert("Please enter a username")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/instagram/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          username: formData.username.replace('@', ''), // Remove @ if user adds it
          displayName: formData.displayName || formData.username,
        }),
      })

      if (response.ok) {
        alert("Instagram account connected successfully!")
        onAccountAdded()
        onClose()
      } else {
        const error = await response.text()
        alert(`Failed to connect account: ${error}`)
      }
    } catch (error) {
      console.error("Connection failed:", error)
      alert("Failed to connect account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Instagram className="w-5 h-5 text-pink-600" />
            <span>Connect Instagram Account</span>
          </DialogTitle>
          <DialogDescription>
            Add your Instagram account to start using our services
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Instagram Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="your_username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Enter without the @ symbol
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name (Optional)</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Account"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
