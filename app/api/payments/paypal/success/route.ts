import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")
    const payerId = searchParams.get("PayerID")

    if (!paymentId || !payerId) {
      return redirect("/pricing?error=payment_failed")
    }

    // Get PayPal access token
    const paypalAuth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString(
      "base64",
    )

    const tokenResponse = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${paypalAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })

    const tokenData = await tokenResponse.json()

    // Execute PayPal payment
    const executeResponse = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/payments/payment/${paymentId}/execute`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payer_id: payerId }),
    })

    const executeData = await executeResponse.json()

    if (executeData.state === "approved") {
      // Extract user and plan info from custom field
      const customData = JSON.parse(executeData.transactions[0].custom)
      const { userId, planId } = customData

      // Update user subscription in database
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          subscriptionId: paymentId,
          subscriptionStatus: "active",
          planType: planId,
        },
      })

      return redirect("/dashboard?success=subscription_activated")
    }

    return redirect("/pricing?error=payment_failed")
  } catch (error) {
    console.error("PayPal payment execution error:", error)
    return redirect("/pricing?error=payment_failed")
  }
}
