
import puppeteer from 'puppeteer'
import { prisma } from './prisma'
import { botAccountManager } from './bot-account-manager'

interface AccountCreationConfig {
  emailService: 'tempmail' | 'guerrillamail' | 'custom'
  phoneService: 'sms-activate' | 'receive-sms' | 'custom'
  proxyService?: string
  captchaSolver?: 'anticaptcha' | '2captcha' | 'capsolver'
}

export class InstagramAccountCreator {
  private browser: any = null
  private page: any = null
  private config: AccountCreationConfig

  constructor(config: AccountCreationConfig) {
    this.config = config
  }

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
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    })
    
    this.page = await this.browser.newPage()
    
    // Set realistic user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // Set viewport
    await this.page.setViewport({ width: 1366, height: 768 })
  }

  async createAccount(): Promise<{ username: string, email: string, password: string, phone: string } | null> {
    try {
      // Step 1: Get temporary email
      const email = await this.getTemporaryEmail()
      if (!email) throw new Error('Failed to get temporary email')

      // Step 2: Get temporary phone number
      const phone = await this.getTemporaryPhone()
      if (!phone) throw new Error('Failed to get temporary phone')

      // Step 3: Generate account details
      const username = this.generateUsername()
      const password = this.generatePassword()
      const fullName = this.generateFullName()

      // Step 4: Navigate to Instagram signup
      await this.page.goto('https://www.instagram.com/accounts/emailsignup/', {
        waitUntil: 'networkidle2'
      })

      // Step 5: Fill signup form
      await this.fillSignupForm(email, fullName, username, password)

      // Step 6: Handle phone verification
      const verificationSuccess = await this.handlePhoneVerification(phone)
      if (!verificationSuccess) throw new Error('Phone verification failed')

      // Step 7: Complete profile setup
      await this.completeProfileSetup()

      // Step 8: Add to bot account pool
      await botAccountManager.addDedicatedBotAccount(username, password)

      // Step 9: Store in database
      await this.storeAccountData(username, email, password, phone)

      return { username, email, password, phone }

    } catch (error) {
      console.error('Account creation failed:', error)
      return null
    }
  }

  private async getTemporaryEmail(): Promise<string | null> {
    try {
      switch (this.config.emailService) {
        case 'tempmail':
          return await this.getTempMailEmail()
        case 'guerrillamail':
          return await this.getGuerrillaMailEmail()
        default:
          return `user${Date.now()}@tempmail.com` // Fallback
      }
    } catch (error) {
      console.error('Failed to get temporary email:', error)
      return null
    }
  }

  private async getTempMailEmail(): Promise<string | null> {
    try {
      // You'd integrate with TempMail API here
      // For demo, returning a mock email
      return `user${Date.now()}@tempmail.com`
    } catch (error) {
      return null
    }
  }

  private async getGuerrillaMailEmail(): Promise<string | null> {
    try {
      // You'd integrate with GuerrillaMail API here
      // For demo, returning a mock email
      return `user${Date.now()}@guerrillamail.com`
    } catch (error) {
      return null
    }
  }

  private async getTemporaryPhone(): Promise<string | null> {
    try {
      switch (this.config.phoneService) {
        case 'sms-activate':
          return await this.getSMSActivatePhone()
        case 'receive-sms':
          return await this.getReceiveSMSPhone()
        default:
          return '+1234567890' // Fallback
      }
    } catch (error) {
      console.error('Failed to get temporary phone:', error)
      return null
    }
  }

  private async getSMSActivatePhone(): Promise<string | null> {
    try {
      // You'd integrate with SMS-Activate API here
      const response = await fetch('https://sms-activate.org/stubs/handler_api.php?api_key=YOUR_API_KEY&action=getNumber&service=ig&country=0')
      const data = await response.text()
      
      if (data.includes('ACCESS_NUMBER')) {
        const parts = data.split(':')
        return parts[2] // Phone number
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  private async getReceiveSMSPhone(): Promise<string | null> {
    try {
      // You'd integrate with Receive-SMS API here
      return '+1234567890' // Mock phone
    } catch (error) {
      return null
    }
  }

  private generateUsername(): string {
    const adjectives = ['cool', 'awesome', 'amazing', 'fantastic', 'wonderful', 'brilliant', 'creative', 'unique']
    const nouns = ['user', 'artist', 'creator', 'explorer', 'adventurer', 'dreamer', 'builder', 'maker']
    const numbers = Math.floor(Math.random() * 9999)
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    
    return `${adjective}_${noun}_${numbers}`
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  private generateFullName(): string {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    return `${firstName} ${lastName}`
  }

  private async fillSignupForm(email: string, fullName: string, username: string, password: string) {
    // Wait for form elements
    await this.page.waitForSelector('input[name="emailOrPhone"]')
    
    // Fill email
    await this.page.type('input[name="emailOrPhone"]', email)
    await this.randomDelay(1000)
    
    // Fill full name
    await this.page.type('input[name="fullName"]', fullName)
    await this.randomDelay(1000)
    
    // Fill username
    await this.page.type('input[name="username"]', username)
    await this.randomDelay(1000)
    
    // Fill password
    await this.page.type('input[name="password"]', password)
    await this.randomDelay(2000)
    
    // Submit form
    await this.page.click('button[type="submit"]')
    
    // Wait for navigation or next step
    await this.page.waitForNavigation({ waitUntil: 'networkidle2' })
  }

  private async handlePhoneVerification(phone: string): Promise<boolean> {
    try {
      // Check if phone verification is required
      const phoneInput = await this.page.$('input[name="phone"]')
      if (phoneInput) {
        await this.page.type('input[name="phone"]', phone)
        await this.page.click('button[type="submit"]')
        
        // Wait for SMS code
        await this.page.waitForSelector('input[name="confirmationCode"]', { timeout: 60000 })
        
        // Get SMS code (you'd implement actual SMS retrieval here)
        const smsCode = await this.getSMSCode(phone)
        if (!smsCode) return false
        
        await this.page.type('input[name="confirmationCode"]', smsCode)
        await this.page.click('button[type="submit"]')
        
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' })
      }
      
      return true
    } catch (error) {
      console.error('Phone verification failed:', error)
      return false
    }
  }

  private async getSMSCode(phone: string): Promise<string | null> {
    // You'd implement actual SMS code retrieval here
    // For demo, returning a mock code
    return '123456'
  }

  private async completeProfileSetup() {
    try {
      // Skip profile photo upload if prompted
      const skipButton = await this.page.$x("//button[contains(text(), 'Skip')]")
      if (skipButton.length > 0) {
        await skipButton[0].click()
        await this.randomDelay(2000)
      }
      
      // Skip contact syncing if prompted
      const notNowButton = await this.page.$x("//button[contains(text(), 'Not Now')]")
      if (notNowButton.length > 0) {
        await notNowButton[0].click()
        await this.randomDelay(2000)
      }
      
      // Skip notifications if prompted
      const notNowButton2 = await this.page.$x("//button[contains(text(), 'Not Now')]")
      if (notNowButton2.length > 0) {
        await notNowButton2[0].click()
        await this.randomDelay(2000)
      }
    } catch (error) {
      // Profile setup steps are optional
      console.log('Profile setup completed or skipped')
    }
  }

  private async storeAccountData(username: string, email: string, password: string, phone: string) {
    await prisma.createdAccount.create({
      data: {
        username,
        email,
        password: this.encryptPassword(password),
        phone,
        createdAt: new Date(),
        isActive: true,
        accountType: 'auto_generated'
      }
    })
  }

  private encryptPassword(password: string): string {
    // Implement proper encryption here
    return password // For demo only
  }

  private async randomDelay(baseDelay: number = 3000): Promise<void> {
    const delay = baseDelay + Math.random() * 2000
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

export class AccountCreationManager {
  private creators = new Map<string, InstagramAccountCreator>()

  async createBatchAccounts(count: number): Promise<void> {
    console.log(`Starting batch creation of ${count} Instagram accounts...`)
    
    const config: AccountCreationConfig = {
      emailService: 'tempmail',
      phoneService: 'sms-activate',
      captchaSolver: 'anticaptcha'
    }

    const promises = []
    for (let i = 0; i < count; i++) {
      promises.push(this.createSingleAccount(config, i))
      
      // Add delay between account creations to avoid rate limiting
      if (i > 0 && i % 3 === 0) {
        await new Promise(resolve => setTimeout(resolve, 60000)) // 1 minute delay every 3 accounts
      }
    }

    const results = await Promise.allSettled(promises)
    const successful = results.filter(r => r.status === 'fulfilled').length
    
    console.log(`Account creation completed: ${successful}/${count} accounts created successfully`)
  }

  private async createSingleAccount(config: AccountCreationConfig, index: number): Promise<void> {
    const creator = new InstagramAccountCreator(config)
    
    try {
      await creator.initialize()
      const result = await creator.createAccount()
      
      if (result) {
        console.log(`Account ${index + 1} created successfully: ${result.username}`)
      } else {
        console.error(`Account ${index + 1} creation failed`)
      }
    } catch (error) {
      console.error(`Account ${index + 1} creation error:`, error)
    } finally {
      await creator.close()
    }
  }

  // Create accounts on a schedule
  async startScheduledCreation(accountsPerDay: number = 10) {
    const intervalMs = (24 * 60 * 60 * 1000) / accountsPerDay // Distribute throughout the day
    
    console.log(`Starting scheduled account creation: ${accountsPerDay} accounts per day`)
    
    setInterval(async () => {
      try {
        await this.createBatchAccounts(1)
      } catch (error) {
        console.error('Scheduled account creation failed:', error)
      }
    }, intervalMs)
  }
}

export const accountCreationManager = new AccountCreationManager()
