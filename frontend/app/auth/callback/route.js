import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /auth/callback
 *
 * Supabase redirects here after Google OAuth completes.
 * This route exchanges the one-time `code` param for a real session,
 * sets the session cookies, then redirects the user onward.
 *
 * Query params Supabase sends:
 *   code  — one-time auth code to exchange for a session
 *   next  — optional redirect path (we default to /products)
 *
 * On failure: redirects to /login?error=auth_callback_failed
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/products'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Session established — send them where they were going
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
  }

  // Missing code or exchange failed — redirect to login with error flag
  return NextResponse.redirect(
    `${origin}/login?error=auth_callback_failed`
  )
}

