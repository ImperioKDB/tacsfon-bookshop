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

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  const protectedRoutes = ['/cart', '/checkout', '/orders', '/profile']
  const adminRoutes = ['/admin']

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r))
  const isAdmin = adminRoutes.some(r => pathname.startsWith(r))

  // Redirect unauthenticated users away from protected routes
  if ((isProtected || isAdmin) && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from auth pages
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/products', request.url))
  }

  // NOTE: Admin role check (role === 'admin') is done client-side in /admin/layout.js
  // Middleware can only confirm session existence, not query the profiles table

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
