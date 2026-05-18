import { NextResponse } from 'next/server'

/**
 * GET /auth/callback
 *
 * Passes the OAuth code to the destination page.
 * createBrowserClient with detectSessionInUrl:true automatically
 * detects the code on page load and exchanges it — no manual
 * exchangeCodeForSession call needed, no hanging promise.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/products'
  const safeNext = next.startsWith('/') ? next : '/products'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const dest = new URL(`${origin}${safeNext}`)
  dest.searchParams.set('code', code)
  return NextResponse.redirect(dest.toString())
}
