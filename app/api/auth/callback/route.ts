import { NextRequest, NextResponse } from "next/server"

/**
 * AuthKit siweUri callback: after signing in Warpcast the user may be redirected here.
 * The main AuthKit flow is client-side polling; this route redirects to home if a client sends the user here.
 */
export function GET(request: NextRequest) {
  const origin = request.nextUrl.origin
  return NextResponse.redirect(new URL("/", origin))
}
