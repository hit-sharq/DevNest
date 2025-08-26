import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()

    const { Body } = callbackData
    const { stkCallback } = Body

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const checkoutRequestId = stkCallback.CheckoutRequestID

      // Update user subscription status
      await prisma.user.updateMany({
        where: { subscriptionId: checkoutRequestId },
        data: {
          subscriptionStatus: "active",
        },
      })

      console.log("M-Pesa payment successful:", checkoutRequestId)
    } else {
      // Payment failed
      const checkoutRequestId = stkCallback.CheckoutRequestID

      await prisma.user.updateMany({
        where: { subscriptionId: checkoutRequestId },
        data: {
          subscriptionStatus: "failed",
        },
      })

      console.log("M-Pesa payment failed:", stkCallback.ResultDesc)
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" })
  } catch (error) {
    console.error("M-Pesa callback error:", error)
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Error" })
  }
}
