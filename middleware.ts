import { createServerClient } from '@supabase/ssr'
import { NextResponse }       from 'next/server'
import type { NextRequest }   from 'next/server'

/**
 * Middleware — lightweight session check only.
 *
 * WHY getSession() instead of getUser():
 *   getUser() makes a live network round-trip to Supabase Auth on every
 *   matched request. On Vercel's Hobby plan, middleware has a hard 1.5 s
 *   timeout — a cold Supabase response easily blows that, producing:
 *     504 GATEWAY_TIMEOUT / MIDDLEWARE_INVOCATION_TIMEOUT
 *
 *   getSession() reads purely from the cookie — zero network latency.
 *   The trade-off is that it trusts the JWT without re-verifying it with
 *   the Supabase server. That is acceptable here because:
 *     1. Middleware only decides WHETHER to redirect, not WHAT data to show.
 *     2. Actual protected pages/layouts call getUser() server-side (where
 *        the timeout is 10-30 s) for real verification before rendering data.
 *     3. A tampered JWT still can't access real data — RLS enforces that
 *        at the database level regardless of what middleware allows through.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Cookie-only read — no network call, no timeout risk.
  // Token refresh (when needed) is handled by Supabase SSR automatically
  // via the set/remove cookie callbacks above.
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  const protectedRoutes = ['/cart', '/checkout', '/orders', '/profile']
  const adminRoutes     = ['/admin']

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
  const isAdmin     = adminRoutes.some(r => pathname.startsWith(r))

  if ((isProtected || isAdmin) && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // DO NOT redirect authenticated users away from /login or /signup here.
  // The client handles post-login redirect to avoid a race condition where
  // the server refreshes an expired token before the browser client catches
  // up — which would send the user to /products unexpectedly.

  return response
}

export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
}
