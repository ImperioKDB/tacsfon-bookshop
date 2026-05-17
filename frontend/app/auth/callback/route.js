import { NextResponse } from 'next/server'

/**
 * GET /auth/callback
 *
 * Redirects the OAuth code to a client-side exchange page.
 *
 * Why not exchange server-side:
 * createServerClient stores the session in cookies, but createBrowserClient
 * reads from localStorage. They use different storage, so the browser never
 * finds the session the server set. By redirecting to a client-side page,
 * the exchange happens in the browser and the session lands in localStorage.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/products'
  const safeNext = next.startsWith('/') ? next : '/products'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const params = new URLSearchParams({ code, next: safeNext })
  return NextResponse.redirect(`${origin}/auth/exchange?${params}`)
}
