import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/admin"

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"])
const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  if (isAdminRoute(req)) {
    const { userId } = await auth()

    if (!userId || !isAdmin(userId)) {
      // Redirect non-admin users to dashboard
      return Response.redirect(new URL("/dashboard", req.url))
    }
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
