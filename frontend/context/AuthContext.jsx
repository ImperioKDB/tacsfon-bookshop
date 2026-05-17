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
    // 1. Read the current session from local storage immediately.
    //    getSession() is essentially synchronous — it resolves in milliseconds.
    //    The .catch() guarantees loading is ALWAYS set to false no matter what.
    supabaseBrowser.auth.getSession()
      .then(async ({ data: { session } }) => {
        const u = session?.user ?? null
        setUser(u)
        setRole(u ? await getUserRole(u.id).catch(() => null) : null)
      })
      .catch(() => {
        setUser(null)
        setRole(null)
      })
      .finally(() => {
        setLoading(false)
      })

    // 2. Keep state in sync on every auth event (login, logout, token refresh).
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null
        setUser(u)
        setRole(u ? await getUserRole(u.id).catch(() => null) : null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
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
