'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import { getUserRole } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null)
  const [role,     setRole]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [verified, setVerified] = useState(false)

  const resolveSession = useCallback(async (session) => {
    if (!session?.user) {
      setUser(null)
      setRole(null)
      setLoading(false)
      setVerified(true)
      return
    }

    setUser(session.user)
    setLoading(false)

    const metaRole = session.user?.user_metadata?.role
    if (metaRole) setRole(metaRole)

    try {
      const fetchedRole = await getUserRole(session.user.id)
      setRole(fetchedRole)
    } catch {
      if (!metaRole) setRole('student')
    }

    setVerified(true)
  }, [])

  useEffect(() => {
    const supabase = getSupabaseBrowser()

    // Read the session from cookie immediately — this is synchronous-fast
    // and ensures the navbar shows the correct state on first render
    // without waiting for a network round-trip.
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveSession(session)
    })

    // Then stay in sync with all auth changes (login, logout, token refresh,
    // Google OAuth callback landing). This fires for every future event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        resolveSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [resolveSession])

  return (
    <AuthContext.Provider value={{ user, role, loading, verified, setUser, setRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
