'use client'
import { useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

/**
 * /auth/callback  — Google OAuth callback handler
 *
 * Spec: /auth/callback/page.js  (client-side, not a server route)
 *
 * Why client-side:
 * The PKCE code verifier is stored in browser localStorage by signInWithOAuth().
 * A server route.js cannot access localStorage, so exchangeCodeForSession()
 * always fails server-side. Running it here in the browser gives full access
 * to the verifier, completing the exchange correctly.
 *
 * Flow:
 *   Google redirect → /auth/callback?code=...
 *   → this page mounts in the browser
 *   → exchangeCodeForSession(code) reads verifier from localStorage ✓
 *   → session stored → hard redirect to destination
 *   → AuthContext re-reads session on fresh page load ✓
 */
export default function AuthCallback() {
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search)
    const code     = params.get('code')
    const next     = params.get('next') || '/products'
    const safeNext = next.startsWith('/') ? next : '/products'

    function fail() {
      window.location.href = '/login?error=auth_callback_failed'
    }

    if (!code) { fail(); return }

    // 15-second failsafe in case of network hang
    const timer = setTimeout(fail, 15_000)

    supabaseBrowser.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        clearTimeout(timer)
        // Hard redirect forces AuthContext to re-read the session from storage
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
