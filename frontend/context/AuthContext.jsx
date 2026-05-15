'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { getUserRole } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [role,    setRole]    = useState(null)
  const [loading, setLoading] = useState(true)   // true until first auth check resolves

  useEffect(() => {
    // 1. Get the current session on mount
    supabaseBrowser.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      setRole(u ? await getUserRole(u.id) : null)
      setLoading(false)   // ← auth check complete; Navbar now renders correctly
    })

    // 2. Keep user/role in sync on every auth event (login, logout, token refresh)
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null
        setUser(u)
        setRole(u ? await getUserRole(u.id) : null)
        // Don't set loading here — we only want the initial spinner, not
        // a flash on every token refresh
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
