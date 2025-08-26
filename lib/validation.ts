import { z } from "zod"

// Common validation patterns
export const phoneNumberSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must not exceed 15 digits")

export const instagramUsernameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9._]{1,30}$/, "Invalid Instagram username format")
  .min(1, "Username is required")
  .max(30, "Username must not exceed 30 characters")
  .transform((val) => val.toLowerCase())

export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .regex(/^https?:\/\/(www\.)?instagram\.com\//, "Must be an Instagram URL")

// Service purchase validation
export const servicePurchaseSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  accountId: z.string().uuid("Invalid account ID format"),
  serviceType: z.enum(["followers", "likes", "comments", "views", "story_views"], {
    errorMap: () => ({ message: "Invalid service type" }),
  }),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(100000, "Quantity cannot exceed 100,000"),
  price: z.number().positive("Price must be positive").max(10000, "Price cannot exceed $10,000"),
  postUrl: z.string().url("Invalid post URL").optional().or(z.literal("")),
})

// Instagram account connection validation
export const instagramConnectSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  username: instagramUsernameSchema,
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must not exceed 50 characters")
    .optional(),
})

// Payment initiation validation
export const paymentInitiateSchema = z.object({
  planId: z.enum(["basic", "pro", "premium"], {
    errorMap: () => ({ message: "Invalid plan type" }),
  }),
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(1, "Minimum amount is $1")
    .max(1000, "Maximum amount is $1000"),
  phoneNumber: phoneNumberSchema,
  userId: z.string().uuid("Invalid user ID format"),
})

// Bot account creation validation
export const botAccountSchema = z.object({
  username: instagramUsernameSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  accountType: z.enum(["dedicated", "user_contributed", "partner"], {
    errorMap: () => ({ message: "Invalid account type" }),
  }),
  contributorUserId: z.string().uuid("Invalid contributor user ID").optional(),
})

// Campaign creation validation
export const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(100, "Campaign name must not exceed 100 characters"),
  targetType: z.enum(["hashtag", "location", "competitor"], {
    errorMap: () => ({ message: "Invalid target type" }),
  }),
  targetValue: z.string().min(1, "Target value is required").max(100, "Target value must not exceed 100 characters"),
  dailyLimit: z
    .number()
    .int("Daily limit must be an integer")
    .min(1, "Daily limit must be at least 1")
    .max(500, "Daily limit cannot exceed 500"),
  isActive: z.boolean().default(true),
})

// Admin user role validation
export const userRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  role: z.enum(["user", "admin", "moderator"], {
    errorMap: () => ({ message: "Invalid role type" }),
  }),
})

// Order status update validation
export const orderStatusSchema = z.object({
  orderId: z.string().uuid("Invalid order ID format"),
  status: z.enum(["pending", "processing", "completed", "failed", "refunded"], {
    errorMap: () => ({ message: "Invalid order status" }),
  }),
  externalOrderId: z.string().optional(),
  completedQuantity: z.number().int().min(0).optional(),
})

// Environment variable validation
export const envSchema = z.object({
  DATABASE_URL: z.string().url("Invalid database URL"),
  CLERK_SECRET_KEY: z.string().min(1, "Clerk secret key is required"),
  MPESA_CONSUMER_KEY: z.string().min(1, "M-Pesa consumer key is required"),
  MPESA_CONSUMER_SECRET: z.string().min(1, "M-Pesa consumer secret is required"),
  MPESA_BASE_URL: z.string().url("Invalid M-Pesa base URL"),
  MPESA_SHORTCODE: z.string().min(1, "M-Pesa shortcode is required"),
  MPESA_PASSKEY: z.string().min(1, "M-Pesa passkey is required"),
  NEXT_PUBLIC_BASE_URL: z.string().url("Invalid base URL"),
  ADMIN_USER_IDS: z.string().min(1, "Admin user IDs are required"),
})

// Validation helper function
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      return { success: false, error: errorMessage }
    }
    return { success: false, error: "Validation failed" }
  }
}

// Rate limiting validation
export const rateLimitSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  limit: z.number().int().min(1, "Limit must be at least 1"),
  windowMs: z.number().int().min(1000, "Window must be at least 1 second"),
})
