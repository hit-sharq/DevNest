"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Zap, Clock } from "lucide-react"
import { PaidServicesModal } from "@/components/services/paid-services-modal"
import { OrderHistoryModal } from "@/components/services/order-history-modal"

interface DashboardHeaderClientProps {
  accounts: any[]
  userId: string | undefined
}

export function DashboardHeaderClient({ accounts, userId }: DashboardHeaderClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPaidServices, setShowPaidServices] = useState(false)
  const [showOrderHistory, setShowOrderHistory] = useState(false)

  if (!userId) {
    return (
      <Button disabled variant="outline">
        Please sign in to access services
      </Button>
    )
  }

  return (
    <>
      <Button onClick={() => setShowCreateModal(true)} className="bg-accent hover:bg-accent/90">
        <Plus className="w-4 h-4 mr-2" />
        Create Campaign
      </Button>
      <div className="flex space-x-2">
        <Button onClick={() => setShowOrderHistory(true)} variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Order History
        </Button>
        <Button onClick={() => setShowPaidServices(true)} className="bg-accent hover:bg-accent/90">
          <Zap className="w-4 h-4 mr-2" />
          Boost Services
        </Button>
      </div>

      {showPaidServices && (
        <PaidServicesModal accounts={accounts} userId={userId} onClose={() => setShowPaidServices(false)} />
      )}

      {showOrderHistory && <OrderHistoryModal userId={userId} onClose={() => setShowOrderHistory(false)} />}
    </>
  )
}
