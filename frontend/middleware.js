import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  // getUser() verifies the token with Supabase's server.
  // We still call it here so the middleware can refresh the token cookie
  // when it expires — keeping the session alive automatically.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const protectedRoutes = ['/cart', '/checkout', '/orders', '/profile']
  const adminRoutes     = ['/admin']

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
  const isAdmin     = adminRoutes.some(r => pathname.startsWith(r))

  // Redirect unauthenticated users away from protected routes
  if ((isProtected || isAdmin) && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // DO NOT redirect authenticated users away from /login or /signup here.
  // The client (LoginContent / SignupPage) handles that after verifying
  // auth state with getUser(). Doing it here causes a race condition where
  // the server refreshes an expired token and redirects before the browser
  // client has caught up — sending the user to /products unexpectedly.

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
