import { createServerClient } from '@supabase/ssr'
import { NextResponse }        from 'next/server'

/**
 * GET /auth/callback
 *
 * Supabase redirects here after Google OAuth completes.
 * Exchanges the one-time `code` param for a real session,
 * sets the session cookies on the redirect response,
 * then sends the user to their destination.
 *
 * FIX: previously cookies were set on `cookieStore` (the incoming
 * request store) but a separate NextResponse.redirect() was returned.
 * Cookies never reached the browser, so the session was lost.
 * Now we create the response first and set cookies directly on it.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/products'

  // Only allow relative paths to prevent open redirect attacks
  const safeNext = next.startsWith('/') ? next : '/products'

  if (code) {
    // Create the redirect response FIRST so we can attach cookies to it
    const response = NextResponse.redirect(`${origin}${safeNext}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          // Read from the incoming request cookies (for PKCE verifier)
          get(name) {
            return request.cookies.get(name)?.value
          },
          // Write to the RESPONSE that the browser will actually receive
          set(name, value, options) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name, options) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Session cookies are now on `response` — browser will receive them
      return response
    }

    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
