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

  // getUser() hits the Supabase server to verify the token is still valid.
  // getSession() only reads the cookie — it won't detect a logged-out session.
  // Using getUser() prevents the stale-session redirect bug on /login after logout.
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

  // Only redirect away from login/signup if the user is genuinely authenticated
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/products'
    return NextResponse.redirect(new URL(redirect, request.url))
  }

  // NOTE: Admin role check (role === 'admin') is done client-side in /admin/layout.js
  // Middleware only confirms session existence

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

