import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { paymentInitiateSchema, validateRequest } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestData = await request.json()

    const validation = validateRequest(paymentInitiateSchema, requestData)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { planId, amount, phoneNumber, userId } = validation.data

    const requiredEnvVars = [
      "MPESA_CONSUMER_KEY",
      "MPESA_CONSUMER_SECRET",
      "MPESA_BASE_URL",
      "MPESA_SHORTCODE",
      "MPESA_PASSKEY",
    ]
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`)
        return NextResponse.json({ error: "Payment service configuration error" }, { status: 500 })
      }
    }

    // M-Pesa API integration
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString(
      "base64",
    )

    // Get M-Pesa access token
    const tokenResponse = await fetch(`${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to get M-Pesa access token")
    }

    const tokenData = await tokenResponse.json()

    // Generate timestamp and password
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3)
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString(
      "base64",
    )

    // Initiate STK Push
    const stkResponse = await fetch(`${process.env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount * 130), // Convert USD to KSh
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/mpesa/callback`,
        AccountReference: `DevNest-JM-${planId}`,
        TransactionDesc: `DevNest-JM ${planId} Plan Subscription`,
      }),
    })

    if (!stkResponse.ok) {
      throw new Error("Failed to initiate M-Pesa STK push")
    }

    const stkData = await stkResponse.json()

    if (stkData.ResponseCode === "0") {
      // Store pending payment in database
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          subscriptionId: stkData.CheckoutRequestID,
          subscriptionStatus: "pending",
          planType: planId,
        },
      })

      return NextResponse.json({ success: true, checkoutRequestId: stkData.CheckoutRequestID })
    }

    return NextResponse.json({ error: "Payment initiation failed" }, { status: 400 })
  } catch (error) {
    console.error("M-Pesa payment initiation error:", error)
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 })
  }
}
