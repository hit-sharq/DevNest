import { prisma } from './prisma'
import { smmProviderManager, type SMMOrderRequest } from './smm-providers'

export interface OrderProcessingResult {
  success: boolean
  orderId?: string
  providerOrderId?: string
  error?: string
}

export class OrderProcessor {
  private processingQueue: string[] = []
  private isProcessing = false

  constructor() {
    // Start processing queue if enabled
    if (process.env.ORDER_QUEUE_ENABLED === 'true') {
      this.startQueueProcessor()
    }
  }

  async processOrder(orderDbId: string): Promise<OrderProcessingResult> {
    try {
      // Get order from database
      const order = await prisma.serviceOrder.findUnique({
        where: { id: orderDbId },
        include: { account: true }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      // Skip if already processing or completed
      if (order.status === 'processing' || order.status === 'completed') {
        return { success: true, orderId: order.id }
      }

      // Check bot availability using our new handler
      const { botUnavailabilityHandler } = await import('./bot-unavailability-handler')
      const availabilityCheck = await botUnavailabilityHandler.handleOrderRequest(
        order.serviceType,
        order.quantity,
        order.userId
      )

      if (!availabilityCheck.canProceed && availabilityCheck.strategy === 'reject') {
        // Order cannot be processed at all
        await prisma.serviceOrder.update({
          where: { id: order.id },
          data: { 
            status: 'failed',
            failureReason: availabilityCheck.message
          }
        })

        return {
          success: false,
          error: availabilityCheck.message
        }
      }

      // Process based on availability strategy
      if (availabilityCheck.strategy === 'queue' || order.status === 'queued') {
        console.log(`Queueing order ${order.id} - insufficient bots available`)
        
        await prisma.serviceOrder.update({
          where: { id: order.id },
          data: { 
            status: 'queued',
            scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            priority: 5
          }
        })

        return {
          success: true,
          orderId: order.id,
          providerOrderId: `queued_${order.id}`
        }
      }

      if (availabilityCheck.strategy === 'partial') {
        console.log(`Processing order ${order.id} partially - limited bot availability`)
        
        // Update quantity to what can be delivered immediately
        const maxQuantity = availabilityCheck.alternatives?.find(a => a.type === 'partial')?.maxQuantity || order.quantity
        
        await prisma.serviceOrder.update({
          where: { id: order.id },
          data: { 
            quantity: maxQuantity,
            originalQuantity: order.quantity,
            status: 'processing',
            startedAt: new Date(),
            providerId: 'internal'
          }
        })

        // Create a separate queued order for the remainder
        const remainingQuantity = order.quantity - maxQuantity
        if (remainingQuantity > 0) {
          await prisma.serviceOrder.create({
            data: {
              userId: order.userId,
              accountId: order.accountId,
              serviceType: order.serviceType,
              quantity: remainingQuantity,
              price: Math.ceil((order.price * remainingQuantity) / order.quantity),
              status: 'queued',
              orderDate: new Date(),
              parentOrderId: order.id
            }
          })
        }
      } else {
        // Full processing available
        console.log(`Processing order ${order.id} internally using bot network`)
        
        await prisma.serviceOrder.update({
          where: { id: order.id },
          data: { 
            status: 'processing',
            startedAt: new Date(),
            providerId: 'internal'
          }
        })
      }

      // Import internal processor
      const { internalOrderProcessor } = await import('./internal-order-processor')
      
      // Add to internal queue with appropriate priority
      const priority = order.status === 'queued' ? 3 : 10
      await internalOrderProcessor.addToQueue(order.id, priority)

      return {
        success: true,
        orderId: order.id,
        providerOrderId: `internal_${order.id}`
      }

    } catch (error) {
      console.error('Order processing failed:', error)

      // Update order status to failed
      await prisma.serviceOrder.update({
        where: { id: orderDbId },
        data: { status: 'failed' }
      }).catch(console.error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private buildTargetLink(order: any): string {
    // For followers, use profile URL
    if (order.serviceType === 'followers') {
      return `https://instagram.com/${order.account.username}`
    }
    
    // For likes, comments, views, use post URL
    if (order.postUrl) {
      return order.postUrl
    }

    // Fallback to profile URL
    return `https://instagram.com/${order.account.username}`
  }

  private async getServiceMapping(serviceType: string): Promise<{ serviceId: string, providerId: string } | null> {
    // This would typically be stored in database
    // For now, we'll use environment variables or hardcoded mappings
    const mappings: Record<string, string> = {
      'followers': process.env.SMM_SERVICE_ID_FOLLOWERS || '1',
      'likes': process.env.SMM_SERVICE_ID_LIKES || '2',
      'comments': process.env.SMM_SERVICE_ID_COMMENTS || '3',
      'views': process.env.SMM_SERVICE_ID_VIEWS || '4',
      'story_views': process.env.SMM_SERVICE_ID_STORY_VIEWS || '5'
    }

    const serviceId = mappings[serviceType]
    if (!serviceId) return null

    const provider = smmProviderManager.getPrimaryProvider()
    if (!provider) return null

    return {
      serviceId,
      providerId: provider.id
    }
  }

  async addToQueue(orderDbId: string): Promise<void> {
    if (!this.processingQueue.includes(orderDbId)) {
      this.processingQueue.push(orderDbId)
      console.log(`Order ${orderDbId} added to processing queue`)
    }
  }

  private async startQueueProcessor(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true
    console.log('Order queue processor started')

    while (true) {
      try {
        if (this.processingQueue.length > 0) {
          const orderDbId = this.processingQueue.shift()
          if (orderDbId) {
            console.log(`Processing order from queue: ${orderDbId}`)
            await this.processOrder(orderDbId)
            
            // Add delay between orders
            const delay = parseInt(process.env.ORDER_PROCESSING_DELAY || '30') * 1000
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        } else {
          // Wait before checking queue again
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      } catch (error) {
        console.error('Queue processor error:', error)
        await new Promise(resolve => setTimeout(resolve, 10000)) // Wait longer on error
      }
    }
  }

  async updateOrderStatus(orderDbId: string): Promise<void> {
    try {
      const order = await prisma.serviceOrder.findUnique({
        where: { id: orderDbId }
      })

      if (!order || !order.providerOrderId || !order.providerId) {
        return
      }

      // Get status from SMM provider
      const smmOrder = await smmProviderManager.getOrderStatus(
        order.providerOrderId,
        order.providerId
      )

      // Calculate delivered amount
      const delivered = order.quantity - smmOrder.remains

      // Update database
      await prisma.serviceOrder.update({
        where: { id: order.id },
        data: {
          delivered: Math.max(delivered, 0),
          status: this.mapProviderStatus(smmOrder.status)
        }
      })

      // Mark as completed if fully delivered
      if (delivered >= order.quantity && smmOrder.status === 'Completed') {
        await prisma.serviceOrder.update({
          where: { id: order.id },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        })
      }

    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  private async shouldUseInternalDelivery(order: any): Promise<boolean> {
    const { deliveryConfigManager } = await import('./delivery-config')
    
    const availableBots = await this.getAvailableBotCount()
    
    return deliveryConfigManager.shouldUseInternalDelivery(
      order.serviceType,
      order.quantity,
      availableBots
    )
  }

  private calculateRequiredBots(serviceType: string, quantity: number): number {
    // Different services require different bot ratios
    const botRatios: Record<string, number> = {
      'followers': Math.ceil(quantity / 50), // 1 bot can follow ~50 accounts per day
      'likes': Math.ceil(quantity / 100), // 1 bot can like ~100 posts per day
      'comments': Math.ceil(quantity / 20), // 1 bot can comment ~20 times per day
    }

    return Math.max(1, botRatios[serviceType] || 1)
  }

  private async getAvailableBotCount(): Promise<number> {
    try {
      const activeBots = await prisma.createdAccount.count({
        where: {
          isActive: true,
          accountType: 'auto_generated'
        }
      })
      return activeBots
    } catch (error) {
      console.error('Error getting bot count:', error)
      return 0
    }
  }

  private mapProviderStatus(providerStatus: string): string {
    const statusMap: Record<string, string> = {
      'Pending': 'pending',
      'In progress': 'processing',
      'Processing': 'processing',
      'Completed': 'completed',
      'Partial': 'processing',
      'Canceled': 'failed',
      'Error': 'failed'
    }

    return statusMap[providerStatus] || 'processing'
  }

  async startStatusChecker(): Promise<void> {
    const interval = parseInt(process.env.ORDER_STATUS_CHECK_INTERVAL || '60') * 1000

    setInterval(async () => {
      try {
        // Get all processing orders
        const processingOrders = await prisma.serviceOrder.findMany({
          where: {
            status: 'processing',
            providerOrderId: { not: null }
          }
        })

        // Update status for each order
        for (const order of processingOrders) {
          await this.updateOrderStatus(order.id)
          // Small delay between status checks
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

      } catch (error) {
        console.error('Status checker error:', error)
      }
    }, interval)
  }
}

export const orderProcessor = new OrderProcessor()
