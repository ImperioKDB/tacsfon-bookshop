'use client'
import { useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

/**
 * /auth/callback — Google OAuth callback (client-side, per spec)
 *
 * detectSessionInUrl is false in supabase.js so only this page exchanges
 * the code — no double-exchange conflict.
 *
 * Flow:
 *   Google → /auth/callback?code=...
 *   → page mounts in browser
 *   → exchangeCodeForSession(code) reads PKCE verifier from cookie storage
 *   → session stored in cookies (readable by middleware)
 *   → hard redirect to destination
 *   → AuthContext picks up session via getSession()
 */
export default function AuthCallback() {
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search)
    const code     = params.get('code')
    const next     = params.get('next') || '/products'
    const safeNext = next.startsWith('/') ? next : '/products'

    function fail() { window.location.href = '/login?error=auth_callback_failed' }

    if (!code) { fail(); return }

    const timer = setTimeout(fail, 15_000)

    supabaseBrowser.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        clearTimeout(timer)
        window.location.href = error ? '/login?error=auth_callback_failed' : safeNext
      })
      .catch(() => { clearTimeout(timer); fail() })
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
