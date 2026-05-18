'use client'
import { useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

/**
 * /auth/exchange — client-side PKCE code exchange
 *
 * Runs exchangeCodeForSession() in the browser where the PKCE verifier
 * is available in localStorage (stored there by signInWithOAuth()).
 * Uses window.location.href for the final redirect so AuthContext
 * re-initialises from scratch and picks up the new session cleanly.
 *
 * Timeout: if exchange hangs for 15 s, redirect to login as failsafe.
 */
export default function AuthExchange() {
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search)
    const code     = params.get('code')
    const next     = params.get('next') || '/products'
    const safeNext = next.startsWith('/') ? next : '/products'

    function fail() {
      window.location.href = '/login?error=auth_callback_failed'
    }

    if (!code) { fail(); return }

    // 15-second failsafe — covers network hangs
    const timer = setTimeout(fail, 15_000)

    supabaseBrowser.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        clearTimeout(timer)
        // Hard redirect so AuthContext re-reads session from localStorage
        window.location.href = error ? '/login?error=auth_callback_failed' : safeNext
      })
      .catch(() => {
        clearTimeout(timer)
        fail()
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-muted">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent
                        rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary text-sm font-medium">Signing you in...</p>
      </div>
    </div>
  )
}
