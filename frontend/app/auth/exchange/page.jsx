'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'

/**
 * /auth/exchange
 *
 * Exchanges the OAuth code client-side using supabaseBrowser,
 * so the session is stored in localStorage where AuthContext can find it.
 */
export default function AuthExchange() {
  const router = useRouter()

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search)
    const code     = params.get('code')
    const next     = params.get('next') || '/products'
    const safeNext = next.startsWith('/') ? next : '/products'

    if (!code) {
      router.replace('/login?error=auth_callback_failed')
      return
    }

    supabaseBrowser.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          console.error('[auth/exchange]', error.message)
          router.replace('/login?error=auth_callback_failed')
        } else {
          router.replace(safeNext)
        }
      })
      .catch(() => {
        router.replace('/login?error=auth_callback_failed')
      })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-muted">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary text-sm font-medium">Signing you in...</p>
      </div>
    </div>
  )
}
