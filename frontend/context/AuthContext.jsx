'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { getUserRole } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [role,    setRole]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      try {
        // 3-second timeout — if Supabase hangs for any reason,
        // loading still resolves and the buttons appear.
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('auth_timeout')), 3000)
        )
        const { data: { session } } = await Promise.race([
          supabaseBrowser.auth.getSession(),
          timeout,
        ])
        if (cancelled) return
        const u = session?.user ?? null
        setUser(u)
        setRole(u ? await getUserRole(u.id) : null)
      } catch {
        // Network error, timeout, bad env vars — treat as logged-out
        if (!cancelled) { setUser(null); setRole(null) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return
        const u = session?.user ?? null
        setUser(u)
        setRole(u ? await getUserRole(u.id) : null)
        setLoading(false) // also resolve on any auth state change
      }
    )

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
