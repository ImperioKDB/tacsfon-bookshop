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
    // Wrap in async so we can use try/finally — guarantees setLoading(false)
    // is called even if getSession() or getUserRole() throws or rejects.
    async function initAuth() {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession()
        const u = session?.user ?? null
        setUser(u)
        setRole(u ? await getUserRole(u.id) : null)
      } catch {
        // If auth check fails for any reason, treat as logged-out
        setUser(null)
        setRole(null)
      } finally {
        setLoading(false)  // always runs, so buttons always appear
      }
    }

    initAuth()

    // Keep user/role in sync on login, logout, token refresh
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null
        setUser(u)
        setRole(u ? await getUserRole(u.id) : null)
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
