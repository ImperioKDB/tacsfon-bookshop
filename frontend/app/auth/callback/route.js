import { NextResponse } from 'next/server'

/**
 * GET /auth/callback
 *
 * Passes the OAuth code to the client-side exchange page.
 *
 * We do NOT exchange the code server-side because createBrowserClient
 * stores the PKCE code verifier in localStorage, which the server
 * cannot access. The exchange must happen in the browser where
 * localStorage is available.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code    = searchParams.get('code')
  const next    = searchParams.get('next') ?? '/products'
  const safeNext = next.startsWith('/') ? next : '/products'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const params = new URLSearchParams({ code, next: safeNext })
  return NextResponse.redirect(`${origin}/auth/exchange?${params}`)
}
