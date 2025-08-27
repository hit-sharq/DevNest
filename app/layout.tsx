import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata = {
  title: "DevNest-JM - Instagram Growth Platform",
  description: "Professional Instagram growth and analytics platform by DevNest-JM",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <body className="min-h-screen bg-background font-sans">{children}</body>
      </html>
    </ClerkProvider>
  )
}
