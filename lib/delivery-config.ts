
export interface DeliveryConfig {
  enableInternal: boolean
  enableExternal: boolean
  internalPriority: number
  minBotsRequired: number
  maxDailyOrders: number
  botCreationEnabled: boolean
  autoCreateBotsWhenLow: boolean
  serviceSettings: {
    [key: string]: {
      useInternal: boolean
      maxQuantity: number
      botRatio: number
      fallbackStrategy: 'queue' | 'partial' | 'reject'
    }
  }
}

export class DeliveryConfigManager {
  private config: DeliveryConfig

  constructor() {
    this.config = this.loadConfig()
  }

  private loadConfig(): DeliveryConfig {
    return {
      enableInternal: process.env.ENABLE_INTERNAL_DELIVERY !== 'false',
      enableExternal: false, // Disabled external APIs
      internalPriority: parseInt(process.env.INTERNAL_PRIORITY || '10'),
      minBotsRequired: parseInt(process.env.MIN_BOTS_REQUIRED || '1'),
      maxDailyOrders: parseInt(process.env.MAX_DAILY_INTERNAL_ORDERS || '500'),
      botCreationEnabled: process.env.BOT_CREATION_ENABLED === 'true',
      autoCreateBotsWhenLow: process.env.AUTO_CREATE_BOTS_WHEN_LOW === 'true',
      serviceSettings: {
        followers: {
          useInternal: true,
          maxQuantity: 2000,
          botRatio: 25, // More efficient - 1 bot per 25 followers
          fallbackStrategy: 'queue'
        },
        likes: {
          useInternal: true,
          maxQuantity: 10000,
          botRatio: 200, // 1 bot per 200 likes
          fallbackStrategy: 'partial'
        },
        comments: {
          useInternal: true,
          maxQuantity: 500,
          botRatio: 10, // 1 bot per 10 comments
          fallbackStrategy: 'queue'
        },
        views: {
          useInternal: true,
          maxQuantity: 50000,
          botRatio: 1000, // 1 bot per 1000 views
          fallbackStrategy: 'partial'
        }
      }
    }
  }

  shouldUseInternalDelivery(serviceType: string, quantity: number, availableBots: number): boolean {
    if (!this.config.enableInternal) return false

    const serviceConfig = this.config.serviceSettings[serviceType]
    if (!serviceConfig || !serviceConfig.useInternal) return false

    // Always try internal first since external is disabled
    return true
  }

  canFulfillOrder(serviceType: string, quantity: number, availableBots: number): {
    canFulfill: boolean
    strategy: 'full' | 'partial' | 'queue' | 'reject'
    maxQuantity?: number
    estimatedTime?: string
  } {
    const serviceConfig = this.config.serviceSettings[serviceType]
    if (!serviceConfig) {
      return { canFulfill: false, strategy: 'reject' }
    }

    const requiredBots = Math.ceil(quantity / serviceConfig.botRatio)

    if (availableBots >= requiredBots) {
      return {
        canFulfill: true,
        strategy: 'full',
        estimatedTime: this.calculateEstimatedTime(serviceType, quantity)
      }
    }

    // Handle insufficient bots based on fallback strategy
    switch (serviceConfig.fallbackStrategy) {
      case 'partial':
        const maxPossible = availableBots * serviceConfig.botRatio
        return {
          canFulfill: true,
          strategy: 'partial',
          maxQuantity: Math.min(maxPossible, quantity),
          estimatedTime: this.calculateEstimatedTime(serviceType, maxPossible)
        }

      case 'queue':
        return {
          canFulfill: true,
          strategy: 'queue',
          estimatedTime: this.calculateQueueTime(serviceType, quantity, availableBots)
        }

      default:
        return { canFulfill: false, strategy: 'reject' }
    }
  }

  private calculateEstimatedTime(serviceType: string, quantity: number): string {
    // Estimate delivery time based on service type and quantity
    const timePerUnit = {
      followers: 2, // 2 minutes per follower
      likes: 0.5, // 30 seconds per like
      comments: 5, // 5 minutes per comment
      views: 0.1 // 6 seconds per view
    }

    const minutes = (timePerUnit[serviceType] || 1) * quantity
    
    if (minutes < 60) {
      return `${Math.ceil(minutes)} minutes`
    } else if (minutes < 1440) {
      return `${Math.ceil(minutes / 60)} hours`
    } else {
      return `${Math.ceil(minutes / 1440)} days`
    }
  }

  private calculateQueueTime(serviceType: string, quantity: number, availableBots: number): string {
    // Estimate queue time based on current capacity
    const baseTime = this.calculateEstimatedTime(serviceType, quantity)
    const queueMultiplier = availableBots === 0 ? 3 : 2
    
    return `${baseTime} (queued - estimated ${queueMultiplier}x longer)`
  }

  getServiceConfig(serviceType: string) {
    return this.config.serviceSettings[serviceType]
  }

  getConfig(): DeliveryConfig {
    return { ...this.config }
  }
}

export const deliveryConfigManager = new DeliveryConfigManager()
