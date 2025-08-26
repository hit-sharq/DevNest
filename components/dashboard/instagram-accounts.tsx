"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Instagram } from "lucide-react"
import { ConnectAccountModal } from "@/components/instagram/connect-account-modal"

interface InstagramAccountsProps {
  accounts: any[]
  userId: string
}

export function InstagramAccounts({ accounts, userId }: InstagramAccountsProps) {
  const [showConnectModal, setShowConnectModal] = useState(false)

  const handleAccountAdded = () => {
    // Refresh the page to show the new account
    window.location.reload()
  }
  return (
    <Card className="animate-slide-in-right">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Instagram className="w-5 h-5 mr-2 text-pink-600" />
          Instagram Accounts
        </CardTitle>
        <CardDescription>Connect and manage your Instagram accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-6">
            <Instagram className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No accounts connected</p>
            <Button 
              onClick={() => setShowConnectModal(true)}
              className="bg-accent hover:bg-accent/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                <Avatar>
                  <AvatarImage src={account.profilePic || "/placeholder.svg"} />
                  <AvatarFallback>{account.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">@{account.username}</h3>
                  <p className="text-sm text-muted-foreground">{account.followersCount.toLocaleString()} followers</p>
                </div>
                <div className="text-right">
                  <div className={`w-2 h-2 rounded-full ${account.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full bg-transparent"
              onClick={() => setShowConnectModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Account
            </Button>
          </div>
        )}
      </CardContent>
      
      {showConnectModal && (
        <ConnectAccountModal
          userId={userId}
          onClose={() => setShowConnectModal(false)}
          onAccountAdded={handleAccountAdded}
        />
      )}
    </Card>
  )
}
