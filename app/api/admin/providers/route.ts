import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/admin"
import { smmProviderManager } from "@/lib/smm-providers"

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const providers = smmProviderManager.getActiveProviders()
    
    // Test connectivity for each provider
    const providersWithStatus = await Promise.all(
      providers.map(async (provider) => {
        let isConnected = false
        let lastError = null

        try {
          await smmProviderManager.makeRequest(provider, { action: 'balance' })
          isConnected = true
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Connection failed'
        }

        return {
          ...provider,
          isConnected,
          lastError,
          apiKey: provider.apiKey.substring(0, 8) + '...' // Hide full API key
        }
      })
    )

    return NextResponse.json({ providers: providersWithStatus })

  } catch (error) {
    console.error("Provider fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, providerId } = await request.json()

    switch (action) {
      case "test_connection":
        const provider = smmProviderManager.getProviderById(providerId)
        if (!provider) {
          return NextResponse.json({ error: "Provider not found" }, { status: 404 })
        }

        try {
          const result = await smmProviderManager.makeRequest(provider, { action: 'balance' })
          return NextResponse.json({ 
            success: true, 
            message: "Connection successful",
            balance: result.balance
          })
        } catch (error) {
          return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Connection failed'
          })
        }

      case "get_services":
        try {
          const services = await smmProviderManager.getServices(providerId)
          return NextResponse.json({ services })
        } catch (error) {
          return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Failed to fetch services'
          }, { status: 500 })
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    console.error("Provider action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
