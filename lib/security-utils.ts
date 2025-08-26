import type { NextRequest } from "next/server"

export function getClientIP(req: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const cfConnectingIp = req.headers.get("cf-connecting-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  return realIp || cfConnectingIp || req.ip || "unknown"
}

export function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false

  const allowedOrigins = [process.env.NEXT_PUBLIC_BASE_URL, "http://localhost:3000", "https://localhost:3000"].filter(
    Boolean,
  )

  return allowedOrigins.includes(origin)
}

export function sanitizeUserAgent(userAgent: string | null): string {
  if (!userAgent) return "unknown"

  // Remove potentially malicious characters
  return userAgent.replace(/[<>'"]/g, "").substring(0, 200)
}

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false

  const botPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i, /postman/i]

  return botPatterns.some((pattern) => pattern.test(userAgent))
}

export function detectSuspiciousActivity(req: NextRequest): {
  isSuspicious: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  const userAgent = req.headers.get("user-agent")
  const referer = req.headers.get("referer")

  // Check for missing user agent
  if (!userAgent) {
    reasons.push("Missing user agent")
  }

  // Check for suspicious user agents
  if (userAgent && isBot(userAgent)) {
    reasons.push("Bot user agent detected")
  }

  // Check for suspicious referers
  if (referer && !isValidOrigin(referer)) {
    reasons.push("Invalid referer")
  }

  // Check for too many headers (potential attack)
  if (req.headers.entries && Array.from(req.headers.entries()).length > 50) {
    reasons.push("Excessive headers")
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  }
}

export function logSecurityEvent(event: {
  type: "rate_limit" | "suspicious_activity" | "auth_failure" | "validation_error"
  ip: string
  userAgent: string
  path: string
  details?: any
}): void {
  console.warn(`[SECURITY] ${event.type.toUpperCase()}`, {
    timestamp: new Date().toISOString(),
    ip: event.ip,
    userAgent: sanitizeUserAgent(event.userAgent),
    path: event.path,
    details: event.details,
  })
}
