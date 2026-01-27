import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error) {
    // If middleware fails, allow request to continue
    // This prevents blocking on missing env vars or other issues
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Only run middleware on protected routes:
     * - /dashboard (and sub-routes)
     * - /checkout (and sub-routes)
     * - /callback (auth callback)
     * - /api/stripe (Stripe endpoints)
     * - /api/telegram (Telegram endpoints)
     */
    '/dashboard/:path*',
    '/checkout/:path*',
    '/callback',
    '/api/stripe/:path*',
    '/api/telegram/:path*',
  ],
}
