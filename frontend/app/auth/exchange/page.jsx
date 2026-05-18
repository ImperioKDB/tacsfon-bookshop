'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

/**
 * /auth/exchange — fallback exchange page (kept for older links that point here)
 *
 * detectSessionInUrl:true in supabaseBrowser handles the exchange automatically.
 * This page just waits for AuthContext to confirm the session, then redirects.
 * A 10-second timeout redirects to login if something goes wrong.
 */
export default function AuthExchange() {
  const router  = useRouter()
  const { user } = useAuth()
  const [next,  setNext]  = useState('/products')

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search)
    const n        = params.get('next') || '/products'
    setNext(n.startsWith('/') ? n : '/products')
  }, [])

  // Redirect once user is set by onAuthStateChange
  useEffect(() => {
    if (user) router.replace(next)
  }, [user, next, router])

  // 10-second fallback to avoid infinite spinner
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/login?error=auth_callback_failed')
    }, 10_000)
    return () => clearTimeout(t)
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
