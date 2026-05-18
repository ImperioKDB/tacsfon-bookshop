import { createServerClient } from '@supabase/ssr'
import { NextResponse }        from 'next/server'

/**
 * GET /auth/callback
 *
 * Exchanges the OAuth authorisation code for a session server-side,
 * then sets the session cookies directly on the redirect response so the
 * browser receives them and createBrowserClient can read the session.
 *
 * WHY server-side (not client-side):
 * With PKCE flow the code must be exchanged using the code verifier that
 * was stored as a cookie during signInWithOAuth. Only the server callback
 * can read that request cookie and write session cookies onto the response
 * in a single round trip. detectSessionInUrl only handles implicit-flow
 * hash tokens, not PKCE query-param codes.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code    = searchParams.get('code')
  const next    = searchParams.get('next') ?? '/products'
  const safeNext = next.startsWith('/') ? next : '/products'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  // Create the redirect response FIRST so we can attach cookies to it
  const response = NextResponse.redirect(`${origin}${safeNext}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Read the PKCE verifier from the incoming request
        get(name)              { return request.cookies.get(name)?.value },
        // Write session tokens onto the response the browser will receive
        set(name, value, opts) { response.cookies.set({ name, value, ...opts }) },
        remove(name, opts)     { response.cookies.set({ name, value: '', ...opts }) },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback]', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  return response   // carries the session cookies to the browser
}
