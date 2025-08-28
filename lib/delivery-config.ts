
export interface DeliveryConfig {
  enableInternal: boolean
  enableExternal: boolean
  internalPriority: number // 0-10, higher = more priority
  externalPriority: number
  minBotsRequired: number
  maxDailyOrders: number
  serviceSettings: {
    [key: string]: {
      useInternal: boolean
      maxQuantity: number
      botRatio: number
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
      enableInternal: process.env.ENABLE_INTERNAL_DELIVERY === 'true',
      enableExternal: process.env.ENABLE_EXTERNAL_DELIVERY !== 'false',
      internalPriority: parseInt(process.env.INTERNAL_PRIORITY || '8'),
      externalPriority: parseInt(process.env.EXTERNAL_PRIORITY || '3'),
      minBotsRequired: parseInt(process.env.MIN_BOTS_REQUIRED || '5'),
      maxDailyOrders: parseInt(process.env.MAX_DAILY_INTERNAL_ORDERS || '100'),
      serviceSettings: {
        followers: {
          useInternal: true,
          maxQuantity: 1000,
          botRatio: 50 // 1 bot per 50 followers
        },
        likes: {
          useInternal: true,
          maxQuantity: 5000,
          botRatio: 100 // 1 bot per 100 likes
        },
        comments: {
          useInternal: true,
          maxQuantity: 100,
          botRatio: 20 // 1 bot per 20 comments
        },
        views: {
          useInternal: false,
          maxQuantity: 10000,
          botRatio: 200
        }
      }
    }
  }

  shouldUseInternalDelivery(serviceType: string, quantity: number, availableBots: number): boolean {
    if (!this.config.enableInternal) return false

    const serviceConfig = this.config.serviceSettings[serviceType]
    if (!serviceConfig || !serviceConfig.useInternal) return false

    if (quantity > serviceConfig.maxQuantity) return false

    const requiredBots = Math.ceil(quantity / serviceConfig.botRatio)
    if (availableBots < requiredBots || availableBots < this.config.minBotsRequired) {
      return false
    }

    return this.config.internalPriority > this.config.externalPriority
  }

  getServiceConfig(serviceType: string) {
    return this.config.serviceSettings[serviceType]
  }

  getConfig(): DeliveryConfig {
    return { ...this.config }
  }
}

export const deliveryConfigManager = new DeliveryConfigManager()
