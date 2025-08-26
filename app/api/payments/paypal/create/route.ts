import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId, amount, userId } = await request.json()

    // PayPal API integration
    const paypalAuth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString(
      "base64",
    )

    // Get PayPal access token
    const tokenResponse = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${paypalAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })

    const tokenData = await tokenResponse.json()

    // Create PayPal payment
    const paymentResponse = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/payments/payment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "sale",
        payer: { payment_method: "paypal" },
        transactions: [
          {
            amount: {
              total: amount.toString(),
              currency: "USD",
            },
            description: `DevNest-JM ${planId} Plan Subscription`,
            custom: JSON.stringify({ userId, planId }),
          },
        ],
        redirect_urls: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/paypal/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
        },
      }),
    })

    const paymentData = await paymentResponse.json()
    const approvalUrl = paymentData.links.find((link: any) => link.rel === "approval_url")?.href

    return NextResponse.json({ approvalUrl })
  } catch (error) {
    console.error("PayPal payment creation error:", error)
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 })
  }
}
