import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

const ADMIN_LOGIN = "/admin/login"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only handle /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  // Allow the login page through unconditionally
  if (pathname === ADMIN_LOGIN) {
    return NextResponse.next()
  }

  // For all other /admin/* routes, require an active ADMIN session
  const session = await getSession()

  if (!session || (session.role as string) !== "ADMIN") {
    const loginUrl = new URL(ADMIN_LOGIN, request.url)
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Run on every /admin/* route
  matcher: ["/admin/:path*"],
}
