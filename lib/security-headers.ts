export function getSecurityHeaders(): Record<string, string> {
  return {
    // Content Security Policy
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.dev https://*.clerk.accounts.dev",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://clerk.dev https://*.clerk.accounts.dev https://api.clerk.dev wss://clerk.dev",
      "frame-src 'self' https://clerk.dev https://*.clerk.accounts.dev",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),

    // Prevent clickjacking
    "X-Frame-Options": "DENY",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // XSS Protection
    "X-XSS-Protection": "1; mode=block",

    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=(self)",
      "usb=()",
      "magnetometer=()",
      "accelerometer=()",
      "gyroscope=()",
    ].join(", "),

    // Strict Transport Security (HTTPS only)
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    // Cross-Origin Policies
    "Cross-Origin-Embedder-Policy": "credentialless",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",

    // Remove server information
    Server: "",
    "X-Powered-By": "",
  }
}

export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [process.env.NEXT_PUBLIC_BASE_URL, "http://localhost:3000", "https://localhost:3000"].filter(
    Boolean,
  )

  const isAllowedOrigin = origin && allowedOrigins.includes(origin)

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "null",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"].join(
      ", ",
    ),
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
    Vary: "Origin",
  }
}
