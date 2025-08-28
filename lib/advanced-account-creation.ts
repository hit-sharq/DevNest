
import puppeteer from "puppeteer"
import { prisma } from "./prisma"
import { botAccountManager } from "./bot-account-manager"

export class ProxyManager {
  private proxies: string[] = []

  constructor() {
    // Load proxies from environment or external service
    this.loadProxies()
  }

  private loadProxies() {
    // In production, load from proxy service
    this.proxies = [
      "proxy1.example.com:8080",
      "proxy2.example.com:8080",
      // Add your proxy list
    ]
  }

  getRandomProxy(): string | null {
    if (this.proxies.length === 0) return null
    return this.proxies[Math.floor(Math.random() * this.proxies.length)]
  }
}

export class FingerprintManager {
  generateFingerprint() {
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ]

    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 }
    ]

    return {
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      viewport: viewports[Math.floor(Math.random() * viewports.length)],
      timezone: this.getRandomTimezone(),
      language: this.getRandomLanguage()
    }
  }

  private getRandomTimezone(): string {
    const timezones = [
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Berlin",
      "Asia/Tokyo"
    ]
    return timezones[Math.floor(Math.random() * timezones.length)]
  }

  private getRandomLanguage(): string {
    const languages = ["en-US", "en-GB", "de-DE", "fr-FR", "es-ES"]
    return languages[Math.floor(Math.random() * languages.length)]
  }
}

export class AdvancedAccountCreator {
  private proxyManager = new ProxyManager()
  private fingerprintManager = new FingerprintManager()

  async createAccountWithAntiDetection(): Promise<{ success: boolean; account?: any; error?: string }> {
    let browser = null
    
    try {
      const fingerprint = this.fingerprintManager.generateFingerprint()
      const proxy = this.proxyManager.getRandomProxy()

      const browserArgs = [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=VizDisplayCompositor"
      ]

      if (proxy) {
        browserArgs.push(`--proxy-server=${proxy}`)
      }

      browser = await puppeteer.launch({
        headless: true,
        args: browserArgs
      })

      const page = await browser.newPage()

      // Apply fingerprint
      await page.setUserAgent(fingerprint.userAgent)
      await page.setViewport(fingerprint.viewport)
      
      // Remove automation detection
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] })
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })
      })

      // Random delays and human-like behavior
      await this.randomDelay(2000, 5000)

      // Navigate to Instagram
      await page.goto("https://www.instagram.com/accounts/emailsignup/", {
        waitUntil: "networkidle2"
      })

      // Generate account details
      const accountData = this.generateRealisticAccountData()

      // Fill form with human-like typing
      await this.humanLikeTyping(page, 'input[name="emailOrPhone"]', accountData.email)
      await this.randomDelay(500, 1500)

      await this.humanLikeTyping(page, 'input[name="fullName"]', accountData.fullName)
      await this.randomDelay(500, 1500)

      await this.humanLikeTyping(page, 'input[name="username"]', accountData.username)
      await this.randomDelay(500, 1500)

      await this.humanLikeTyping(page, 'input[name="password"]', accountData.password)
      await this.randomDelay(1000, 3000)

      // Submit with random delay
      await page.click('button[type="submit"]')
      await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })

      // Handle potential challenges (phone verification, etc.)
      const challengeHandled = await this.handleVerificationChallenges(page, accountData)
      
      if (!challengeHandled) {
        return { success: false, error: "Verification challenges failed" }
      }

      // Store in database
      await botAccountManager.addDedicatedBotAccount(accountData.username, accountData.password)

      return { 
        success: true, 
        account: {
          username: accountData.username,
          email: accountData.email
        }
      }

    } catch (error) {
      console.error("Advanced account creation error:", error)
      return { success: false, error: error.message }
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }

  private generateRealisticAccountData() {
    const firstNames = ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Avery", "Quinn", "Blake", "Sage"]
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const birthYear = 1990 + Math.floor(Math.random() * 20)
    
    return {
      fullName: `${firstName} ${lastName}`,
      username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${birthYear}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${birthYear}@gmail.com`,
      password: this.generateSecurePassword()
    }
  }

  private generateSecurePassword(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  private async humanLikeTyping(page: any, selector: string, text: string) {
    await page.waitForSelector(selector)
    await page.click(selector)
    
    for (const char of text) {
      await page.type(selector, char, { delay: Math.random() * 100 + 50 })
      if (Math.random() < 0.1) {
        await this.randomDelay(100, 500) // Random pauses
      }
    }
  }

  private async handleVerificationChallenges(page: any, accountData: any): Promise<boolean> {
    try {
      // Check for various verification prompts and handle them
      await this.randomDelay(2000, 5000)
      
      // Skip phone verification if possible
      const skipButtons = await page.$x("//button[contains(text(), 'Skip') or contains(text(), 'Not Now')]")
      if (skipButtons.length > 0) {
        await skipButtons[0].click()
        await this.randomDelay(1000, 3000)
      }

      return true
    } catch (error) {
      console.error("Challenge handling error:", error)
      return false
    }
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

export const advancedAccountCreator = new AdvancedAccountCreator()
