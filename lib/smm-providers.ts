
export interface SMMProvider {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  isActive: boolean
  priority: number // Lower number = higher priority
}

export interface SMMService {
  id: string
  name: string
  type: string // "followers", "likes", "comments", etc.
  category: string
  rate: number // Price per 1000
  min: number
  max: number
  dripfeed: boolean
  refill: boolean
  cancel: boolean
  provider: string
}

export interface SMMOrder {
  orderId: string
  charge: number
  startCount: number
  status: string
  remains: number
  currency: string
}

export interface SMMOrderRequest {
  action: "add"
  service: string
  link: string
  quantity: number
  runs?: number // For dripfeed
  interval?: number // For dripfeed
}

export interface SMMStatusRequest {
  action: "status"
  order: string
}

export interface SMMServiceRequest {
  action: "services"
}

export class SMMProviderManager {
  private providers: SMMProvider[] = []

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Primary provider
    if (process.env.SMM_PANEL_PRIMARY_URL && process.env.SMM_PANEL_PRIMARY_KEY) {
      this.providers.push({
        id: "primary",
        name: "Primary SMM Panel",
        baseUrl: process.env.SMM_PANEL_PRIMARY_URL,
        apiKey: process.env.SMM_PANEL_PRIMARY_KEY,
        isActive: true,
        priority: 1
      })
    }

    // Backup provider
    if (process.env.SMM_PANEL_BACKUP_URL && process.env.SMM_PANEL_BACKUP_KEY) {
      this.providers.push({
        id: "backup",
        name: "Backup SMM Panel",
        baseUrl: process.env.SMM_PANEL_BACKUP_URL,
        apiKey: process.env.SMM_PANEL_BACKUP_KEY,
        isActive: true,
        priority: 2
      })
    }

    // Secondary provider
    if (process.env.SMM_PANEL_SECONDARY_URL && process.env.SMM_PANEL_SECONDARY_KEY) {
      this.providers.push({
        id: "secondary",
        name: "Secondary SMM Panel",
        baseUrl: process.env.SMM_PANEL_SECONDARY_URL,
        apiKey: process.env.SMM_PANEL_SECONDARY_KEY,
        isActive: true,
        priority: 3
      })
    }

    // Sort by priority
    this.providers.sort((a, b) => a.priority - b.priority)
  }

  getActiveProviders(): SMMProvider[] {
    return this.providers.filter(p => p.isActive)
  }

  getPrimaryProvider(): SMMProvider | null {
    return this.providers.find(p => p.isActive) || null
  }

  getProviderById(id: string): SMMProvider | null {
    return this.providers.find(p => p.id === id) || null
  }

  async makeRequest(provider: SMMProvider, data: any): Promise<any> {
    try {
      const formData = new URLSearchParams()
      formData.append('key', provider.apiKey)
      
      Object.keys(data).forEach(key => {
        formData.append(key, data[key])
      })

      const response = await fetch(provider.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return result
    } catch (error) {
      console.error(`Provider ${provider.id} request failed:`, error)
      throw error
    }
  }

  async getServices(providerId?: string): Promise<SMMService[]> {
    const provider = providerId ? this.getProviderById(providerId) : this.getPrimaryProvider()
    
    if (!provider) {
      throw new Error('No active provider available')
    }

    try {
      const response = await this.makeRequest(provider, { action: 'services' })
      return response.map((service: any) => ({
        ...service,
        provider: provider.id
      }))
    } catch (error) {
      console.error('Failed to fetch services:', error)
      throw error
    }
  }

  async createOrder(orderData: SMMOrderRequest, providerId?: string): Promise<SMMOrder> {
    const provider = providerId ? this.getProviderById(providerId) : this.getPrimaryProvider()
    
    if (!provider) {
      throw new Error('No active provider available')
    }

    try {
      const response = await this.makeRequest(provider, orderData)
      return {
        orderId: response.order,
        charge: response.charge,
        startCount: response.start_count || 0,
        status: response.status || 'pending',
        remains: response.remains || orderData.quantity,
        currency: response.currency || 'USD'
      }
    } catch (error) {
      // If primary provider fails and failover is enabled, try backup
      if (process.env.ENABLE_PROVIDER_FAILOVER === 'true' && provider.priority === 1) {
        const backupProvider = this.providers.find(p => p.priority === 2 && p.isActive)
        if (backupProvider) {
          console.log(`Failing over to backup provider: ${backupProvider.id}`)
          return this.createOrder(orderData, backupProvider.id)
        }
      }
      throw error
    }
  }

  async getOrderStatus(orderId: string, providerId?: string): Promise<SMMOrder> {
    const provider = providerId ? this.getProviderById(providerId) : this.getPrimaryProvider()
    
    if (!provider) {
      throw new Error('No active provider available')
    }

    try {
      const response = await this.makeRequest(provider, {
        action: 'status',
        order: orderId
      })

      return {
        orderId: orderId,
        charge: response.charge,
        startCount: response.start_count || 0,
        status: response.status,
        remains: response.remains || 0,
        currency: response.currency || 'USD'
      }
    } catch (error) {
      console.error('Failed to get order status:', error)
      throw error
    }
  }

  async cancelOrder(orderId: string, providerId?: string): Promise<boolean> {
    const provider = providerId ? this.getProviderById(providerId) : this.getPrimaryProvider()
    
    if (!provider) {
      throw new Error('No active provider available')
    }

    try {
      await this.makeRequest(provider, {
        action: 'cancel',
        order: orderId
      })
      return true
    } catch (error) {
      console.error('Failed to cancel order:', error)
      return false
    }
  }

  async refillOrder(orderId: string, providerId?: string): Promise<boolean> {
    const provider = providerId ? this.getProviderById(providerId) : this.getPrimaryProvider()
    
    if (!provider) {
      throw new Error('No active provider available')
    }

    try {
      await this.makeRequest(provider, {
        action: 'refill',
        order: orderId
      })
      return true
    } catch (error) {
      console.error('Failed to refill order:', error)
      return false
    }
  }
}

export const smmProviderManager = new SMMProviderManager()
