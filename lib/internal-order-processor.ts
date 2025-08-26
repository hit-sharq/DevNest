
import { prisma } from './prisma'
import { botManager } from './instagram-bot'

interface OrderQueue {
  id: string
  priority: number
  retryCount: number
  scheduledAt: Date
}

export class InternalOrderProcessor {
  private queue: OrderQueue[] = []
  private isProcessing = false
  private maxRetries = 3
  private processingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startProcessing()
  }

  async addToQueue(orderId: string, priority: number = 0): Promise<void> {
    const queueItem: OrderQueue = {
      id: orderId,
      priority,
      retryCount: 0,
      scheduledAt: new Date()
    }

    this.queue.push(queueItem)
    this.queue.sort((a, b) => b.priority - a.priority) // Higher priority first
  }

  private startProcessing() {
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing && this.queue.length > 0) {
        await this.processNextOrder()
      }
    }, 5000) // Check every 5 seconds
  }

  private async processNextOrder() {
    if (this.queue.length === 0) return

    this.isProcessing = true
    const orderItem = this.queue.shift()!

    try {
      console.log(`Processing order ${orderItem.id}...`)
      
      // Update order status to processing
      await prisma.serviceOrder.update({
        where: { id: orderItem.id },
        data: { 
          status: 'processing',
          startedAt: new Date()
        }
      })

      // Process the order using our bot system
      await botManager.processServiceOrder(orderItem.id)

      console.log(`Order ${orderItem.id} completed successfully`)

    } catch (error) {
      console.error(`Error processing order ${orderItem.id}:`, error)
      
      orderItem.retryCount++
      
      if (orderItem.retryCount < this.maxRetries) {
        // Reschedule for retry
        orderItem.scheduledAt = new Date(Date.now() + 60000 * orderItem.retryCount) // Exponential backoff
        this.queue.push(orderItem)
        this.queue.sort((a, b) => b.priority - a.priority)
        
        console.log(`Order ${orderItem.id} scheduled for retry ${orderItem.retryCount}/${this.maxRetries}`)
      } else {
        // Mark as failed after max retries
        await prisma.serviceOrder.update({
          where: { id: orderItem.id },
          data: { status: 'failed' }
        })
        
        console.log(`Order ${orderItem.id} failed after ${this.maxRetries} retries`)
      }
    } finally {
      this.isProcessing = false
    }
  }

  async getQueueStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      nextOrder: this.queue[0] || null
    }
  }

  async clearQueue() {
    this.queue = []
  }

  destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
    botManager.cleanup()
  }
}

export const internalOrderProcessor = new InternalOrderProcessor()
