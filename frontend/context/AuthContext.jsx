'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
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
    // onAuthStateChange is the single source of truth.
    // It fires INITIAL_SESSION on mount with whatever session exists in the cookie.
    // We no longer skip it — this fixes the Google OAuth navbar bug where
    // user stayed null after being redirected to /products post-login.
    //
    // For the /login stale-session redirect bug: the middleware no longer
    // redirects authenticated users away from /login, so we don't need to
    // block INITIAL_SESSION anymore. The client handles it cleanly.
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (event, session) => {
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
