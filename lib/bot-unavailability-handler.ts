
import { prisma } from './prisma'
import { deliveryConfigManager } from './delivery-config'

export interface UnavailabilityResponse {
  canProceed: boolean
  strategy: 'full' | 'partial' | 'queue' | 'reject' | 'schedule'
  message: string
  alternatives?: {
    type: 'partial' | 'queue' | 'schedule'
    description: string
    maxQuantity?: number
    estimatedTime?: string
    price?: number
  }[]
  recommendedAction?: string
}

export class BotUnavailabilityHandler {
  async handleOrderRequest(
    serviceType: string,
    quantity: number,
    userId: string
  ): Promise<UnavailabilityResponse> {
    const availableBots = await this.getAvailableBotCount()
    const fulfillmentInfo = deliveryConfigManager.canFulfillOrder(
      serviceType,
      quantity,
      availableBots
    )

    if (fulfillmentInfo.canFulfill && fulfillmentInfo.strategy === 'full') {
      return {
        canProceed: true,
        strategy: 'full',
        message: `Your order can be processed immediately. Estimated completion: ${fulfillmentInfo.estimatedTime}`,
      }
    }

    // Handle different unavailability scenarios
    return this.generateAlternatives(serviceType, quantity, availableBots, fulfillmentInfo)
  }

  private async generateAlternatives(
    serviceType: string,
    quantity: number,
    availableBots: number,
    fulfillmentInfo: any
  ): Promise<UnavailabilityResponse> {
    const alternatives = []

    if (availableBots === 0) {
      // No bots available
      alternatives.push({
        type: 'queue' as const,
        description: 'Queue your order for when bots become available',
        estimatedTime: 'Next available slot: 2-6 hours',
        price: 0 // No extra cost for queueing
      })

      alternatives.push({
        type: 'schedule' as const,
        description: 'Schedule your order for later today',
        estimatedTime: 'Choose specific time slot',
        price: 0
      })

      return {
        canProceed: false,
        strategy: 'queue',
        message: `Currently no bots available for ${serviceType}. We're working on creating more accounts.`,
        alternatives,
        recommendedAction: 'We recommend queueing your order - you\'ll be prioritized when bots become available.'
      }
    }

    if (fulfillmentInfo.strategy === 'partial') {
      // Partial fulfillment possible
      alternatives.push({
        type: 'partial' as const,
        description: `Process ${fulfillmentInfo.maxQuantity} ${serviceType} now, queue the rest`,
        maxQuantity: fulfillmentInfo.maxQuantity,
        estimatedTime: fulfillmentInfo.estimatedTime,
        price: this.calculatePartialPrice(serviceType, fulfillmentInfo.maxQuantity, quantity)
      })

      alternatives.push({
        type: 'queue' as const,
        description: `Queue full order (${quantity} ${serviceType})`,
        estimatedTime: this.estimateQueueTime(serviceType, quantity - fulfillmentInfo.maxQuantity!),
        price: 0
      })

      return {
        canProceed: true,
        strategy: 'partial',
        message: `We can deliver ${fulfillmentInfo.maxQuantity} of ${quantity} ${serviceType} immediately.`,
        alternatives,
        recommendedAction: 'We recommend partial delivery to get started immediately.'
      }
    }

    if (fulfillmentInfo.strategy === 'queue') {
      // Queue only
      alternatives.push({
        type: 'queue' as const,
        description: `Queue your full order`,
        estimatedTime: this.estimateQueueTime(serviceType, quantity),
        price: 0
      })

      const reducedQuantity = this.getMaxImmediateQuantity(serviceType, availableBots)
      if (reducedQuantity > 0) {
        alternatives.push({
          type: 'partial' as const,
          description: `Get ${reducedQuantity} ${serviceType} now, queue the rest`,
          maxQuantity: reducedQuantity,
          estimatedTime: 'Immediate',
          price: this.calculatePartialPrice(serviceType, reducedQuantity, quantity)
        })
      }

      return {
        canProceed: true,
        strategy: 'queue',
        message: `Your order will be queued due to high demand.`,
        alternatives,
        recommendedAction: 'Queue your order to maintain your position, or consider a smaller quantity for immediate delivery.'
      }
    }

    // Default rejection with alternatives
    return {
      canProceed: false,
      strategy: 'reject',
      message: `Unable to process ${quantity} ${serviceType} at this time.`,
      alternatives: [
        {
          type: 'schedule' as const,
          description: 'Schedule for off-peak hours (better bot availability)',
          estimatedTime: 'Tonight or early morning',
          price: 0
        }
      ],
      recommendedAction: 'Try a smaller quantity or schedule for later when more bots are available.'
    }
  }

  private calculatePartialPrice(serviceType: string, partialQuantity: number, totalQuantity: number): number {
    // Calculate proportional price for partial delivery
    const fullPrice = this.getServicePrice(serviceType, totalQuantity)
    return Math.ceil((fullPrice * partialQuantity) / totalQuantity)
  }

  private getServicePrice(serviceType: string, quantity: number): number {
    // Base pricing per service type
    const basePrices = {
      followers: 0.01, // $0.01 per follower
      likes: 0.001, // $0.001 per like
      comments: 0.05, // $0.05 per comment
      views: 0.0001 // $0.0001 per view
    }

    return Math.ceil((basePrices[serviceType] || 0.01) * quantity * 100) // Convert to cents
  }

  private estimateQueueTime(serviceType: string, quantity: number): string {
    // Estimate based on current queue and bot creation rate
    const queueLength = this.getEstimatedQueueLength()
    const processingTime = Math.ceil(quantity / 100) // Assume 100 units per hour
    
    const totalHours = Math.ceil(queueLength / 10) + processingTime // 10 orders per hour base rate
    
    if (totalHours < 24) {
      return `${totalHours} hours`
    } else {
      return `${Math.ceil(totalHours / 24)} days`
    }
  }

  private getMaxImmediateQuantity(serviceType: string, availableBots: number): number {
    const serviceConfig = deliveryConfigManager.getServiceConfig(serviceType)
    if (!serviceConfig) return 0
    
    return availableBots * serviceConfig.botRatio
  }

  private async getAvailableBotCount(): Promise<number> {
    try {
      const count = await prisma.instagramAccount.count({
        where: {
          isActive: true,
          accountType: 'auto_generated'
        }
      })
      return count
    } catch (error) {
      console.error('Error getting bot count:', error)
      return 0
    }
  }

  private getEstimatedQueueLength(): number {
    // This would typically check your actual queue
    // For now, return a reasonable estimate
    return Math.floor(Math.random() * 20) + 5 // 5-25 orders in queue
  }

  async createQueuedOrder(
    userId: string,
    serviceType: string,
    quantity: number,
    accountId: string,
    price: number,
    priority: number = 0
  ): Promise<string> {
    const order = await prisma.serviceOrder.create({
      data: {
        userId,
        accountId,
        serviceType,
        quantity,
        price,
        status: 'queued',
        orderDate: new Date(),
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // Default: 2 hours from now
        priority
      }
    })

    // Notify user about queue position
    await this.notifyUserAboutQueue(userId, order.id, serviceType, quantity)

    return order.id
  }

  private async notifyUserAboutQueue(
    userId: string,
    orderId: string,
    serviceType: string,
    quantity: number
  ): Promise<void> {
    // Here you would implement notification logic
    // For now, just log
    console.log(`User ${userId} order ${orderId} queued: ${quantity} ${serviceType}`)
  }

  async getQueueStatus(userId: string): Promise<any> {
    const queuedOrders = await prisma.serviceOrder.findMany({
      where: {
        userId,
        status: 'queued'
      },
      orderBy: {
        priority: 'desc'
      }
    })

    return queuedOrders.map((order, index) => ({
      orderId: order.id,
      serviceType: order.serviceType,
      quantity: order.quantity,
      queuePosition: index + 1,
      estimatedStartTime: order.scheduledFor,
      priority: order.priority
    }))
  }
}

export const botUnavailabilityHandler = new BotUnavailabilityHandler()
