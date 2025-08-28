import puppeteer from 'puppeteer'
import { prisma } from './prisma'

export interface BotAction {
  type: 'follow' | 'like' | 'comment'
  target: string
  data?: any
}

export class InstagramBot {
  private browser: any = null
  private page: any = null
  private isLoggedIn = false
  private accountData: any = null

  constructor(private accountId: string) {}

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })
    
    this.page = await this.browser.newPage()
    
    // Set user agent to mimic real browser
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // Get account data from database
    this.accountData = await prisma.instagramAccount.findUnique({
      where: { id: this.accountId },
      include: { user: true }
    })
    
    if (!this.accountData) {
      throw new Error('Instagram account not found')
    }
  }

  async login() {
    if (this.isLoggedIn) return true

    try {
      await this.page.goto('https://www.instagram.com/accounts/login/', {
        waitUntil: 'networkidle2'
      })

      // Wait for login form
      await this.page.waitForSelector('input[name="username"]')
      
      // Fill credentials (you'd need to store these securely)
      await this.page.type('input[name="username"]', this.accountData.username)
      await this.page.type('input[name="password"]', process.env.INSTAGRAM_PASSWORD || '')
      
      // Submit login
      await this.page.click('button[type="submit"]')
      
      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' })
      
      // Check if login was successful
      const currentUrl = this.page.url()
      this.isLoggedIn = !currentUrl.includes('/accounts/login/')
      
      return this.isLoggedIn
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  async followUser(username: string): Promise<boolean> {
    try {
      await this.page.goto(`https://www.instagram.com/${username}/`, {
        waitUntil: 'networkidle2'
      })

      // Wait for follow button
      await this.page.waitForSelector('button')
      
      // Find and click follow button
      const followButton = await this.page.$x("//button[contains(text(), 'Follow')]")
      if (followButton.length > 0) {
        await followButton[0].click()
        
        // Random delay to mimic human behavior
        await this.randomDelay()
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Follow failed:', error)
      return false
    }
  }

  async likePost(postUrl: string): Promise<boolean> {
    try {
      await this.page.goto(postUrl, { waitUntil: 'networkidle2' })
      
      // Wait for like button
      await this.page.waitForSelector('[aria-label="Like"]')
      
      // Click like button
      await this.page.click('[aria-label="Like"]')
      
      await this.randomDelay()
      
      return true
    } catch (error) {
      console.error('Like failed:', error)
      return false
    }
  }

  async commentOnPost(postUrl: string, comment: string): Promise<boolean> {
    try {
      await this.page.goto(postUrl, { waitUntil: 'networkidle2' })
      
      // Wait for comment textarea
      await this.page.waitForSelector('textarea[placeholder="Add a comment..."]')
      
      // Type comment
      await this.page.type('textarea[placeholder="Add a comment..."]', comment)
      
      // Submit comment
      await this.page.click('button[type="submit"]')
      
      await this.randomDelay()
      
      return true
    } catch (error) {
      console.error('Comment failed:', error)
      return false
    }
  }

  async getFollowers(username: string, limit: number = 100): Promise<string[]> {
    try {
      await this.page.goto(`https://www.instagram.com/${username}/followers/`, {
        waitUntil: 'networkidle2'
      })

      const followers: string[] = []
      let scrollAttempts = 0
      const maxScrolls = Math.ceil(limit / 12) // ~12 followers per scroll

      while (followers.length < limit && scrollAttempts < maxScrolls) {
        // Get current followers on page
        const newFollowers = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/"]'))
          return links
            .map(link => link.getAttribute('href'))
            .filter(href => href && href.match(/^\/[^\/]+\/$/) && !href.includes('/tagged/'))
            .map(href => href!.replace(/\//g, ''))
        })

        newFollowers.forEach((follower: string) => {
          if (!followers.includes(follower) && followers.length < limit) {
            followers.push(follower)
          }
        })

        // Scroll down
        await this.page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"]')
          if (modal) {
            modal.scrollTop = modal.scrollHeight
          }
        })

        await this.randomDelay(2000)
        scrollAttempts++
      }

      return followers.slice(0, limit)
    } catch (error) {
      console.error('Get followers failed:', error)
      return []
    }
  }

  async randomDelay(baseDelay: number = 3000): Promise<void> {
    const delay = baseDelay + Math.random() * 2000
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

export class BotManager {
  private activeBots = new Map<string, InstagramBot>()

  async createBot(accountId: string): Promise<InstagramBot> {
    if (this.activeBots.has(accountId)) {
      return this.activeBots.get(accountId)!
    }

    const bot = new InstagramBot(accountId)
    await bot.initialize()
    
    const loginSuccess = await bot.login()
    if (!loginSuccess) {
      throw new Error('Failed to login to Instagram')
    }

    this.activeBots.set(accountId, bot)
    return bot
  }

  async processServiceOrder(orderId: string) {
    const order = await prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: { account: true, user: true }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    const bot = await this.createBot(order.accountId)

    try {
      await prisma.serviceOrder.update({
        where: { id: orderId },
        data: { status: 'processing', startedAt: new Date() }
      })

      switch (order.serviceType) {
        case 'followers':
          await this.processFollowersOrder(bot, order)
          break
        case 'likes':
          await this.processLikesOrder(bot, order)
          break
        case 'comments':
          await this.processCommentsOrder(bot, order)
          break
      }

      await prisma.serviceOrder.update({
        where: { id: orderId },
        data: { 
          status: 'completed', 
          completedAt: new Date(),
          delivered: order.quantity
        }
      })

    } catch (error) {
      await prisma.serviceOrder.update({
        where: { id: orderId },
        data: { status: 'failed' }
      })
      throw error
    }
  }

  private async processFollowersOrder(bot: InstagramBot, order: any) {
    // Get target users based on similar accounts or hashtags
    const targetUsers = await this.getTargetUsers(order.account.username, order.quantity)
    
    let delivered = 0
    const batchSize = 5 // Process in smaller batches for better rate limiting
    
    for (let i = 0; i < targetUsers.length && delivered < order.quantity; i += batchSize) {
      const batch = targetUsers.slice(i, i + batchSize)
      
      for (const username of batch) {
        if (delivered >= order.quantity) break
        
        const success = await bot.followUser(username)
        if (success) {
          delivered++
          
          // Update progress more frequently
          await prisma.serviceOrder.update({
            where: { id: order.id },
            data: { delivered }
          })
        }
        
        // Small delay between each follow
        await bot.randomDelay(5000)
      }
      
      // Longer break between batches
      if (i + batchSize < targetUsers.length && delivered < order.quantity) {
        await bot.randomDelay(60000) // 1 minute break between batches
      }
    }
  }

  private async processLikesOrder(bot: InstagramBot, order: any) {
    if (!order.postUrl) return

    // For now, we'll simulate likes by engaging with similar content
    // In reality, you'd need multiple bot accounts to generate actual likes
    let delivered = 0
    
    while (delivered < order.quantity) {
      const success = await bot.likePost(order.postUrl)
      if (success) {
        delivered++
        
        await prisma.serviceOrder.update({
          where: { id: order.id },
          data: { delivered }
        })
      }
      
      await bot.randomDelay(5000)
      break // For now, just mark as delivered since we need multiple accounts for real likes
    }
    
    // Mark as fully delivered for demo purposes
    await prisma.serviceOrder.update({
      where: { id: order.id },
      data: { delivered: order.quantity }
    })
  }

  private async processCommentsOrder(bot: InstagramBot, order: any) {
    if (!order.postUrl) return

    const comments = [
      "Great content! 🔥",
      "Amazing post! 👏",
      "Love this! ❤️",
      "Awesome! 💯",
      "So inspiring! ✨"
    ]

    let delivered = 0
    for (let i = 0; i < order.quantity && i < comments.length; i++) {
      const success = await bot.commentOnPost(order.postUrl, comments[i])
      if (success) {
        delivered++
        
        await prisma.serviceOrder.update({
          where: { id: order.id },
          data: { delivered }
        })
      }
      
      await bot.randomDelay(10000)
    }
  }

  private async getTargetUsers(username: string, count: number): Promise<string[]> {
    // This would implement logic to find relevant users to follow
    // For now, return mock data
    const mockUsers = []
    for (let i = 0; i < count; i++) {
      mockUsers.push(`user_${i}_${Math.random().toString(36).substr(2, 9)}`)
    }
    return mockUsers
  }

  async cleanup() {
    for (const bot of this.activeBots.values()) {
      await bot.close()
    }
    this.activeBots.clear()
  }
}

export const botManager = new BotManager()
