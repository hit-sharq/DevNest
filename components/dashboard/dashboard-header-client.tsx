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
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={() => setShowCreateModal(true)} 
          className="bg-accent hover:bg-accent/90"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden xs:inline">Create Campaign</span>
          <span className="xs:hidden">Create</span>
        </Button>
        
        <div className="flex flex-col xs:flex-row gap-2">
          <Button 
            onClick={() => setShowOrderHistory(true)} 
            variant="outline"
            size="sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Order History</span>
            <span className="xs:hidden">Orders</span>
          </Button>
          
          <Button 
            onClick={() => setShowPaidServices(true)} 
            className="bg-accent hover:bg-accent/90"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Boost Services</span>
            <span className="xs:hidden">Boost</span>
          </Button>
        </div>
      </div>

      {showPaidServices && (
        <PaidServicesModal accounts={accounts} userId={userId} onClose={() => setShowPaidServices(false)} />
      )}

      {showOrderHistory && <OrderHistoryModal userId={userId} onClose={() => setShowOrderHistory(false)} />}
    </>
  )
}
