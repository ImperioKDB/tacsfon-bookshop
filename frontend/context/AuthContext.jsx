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
    // ─── IMPORTANT ──────────────────────────────────────────────────────────
    // Use getUser() NOT getSession() here.
    //
    // getSession() reads the session straight from the cookie without hitting
    // Supabase's server. If the token is expired or stale, it still returns a
    // non-null session — so `user` and `verified` get set to truthy values and
    // the login/signup page immediately redirects to /products.
    //
    // getUser() makes a real server round-trip and returns null for any expired
    // or invalid token, so `verified` only becomes true once we know the actual
    // auth state.
    // ────────────────────────────────────────────────────────────────────────
    supabaseBrowser.auth.getUser()
      .then(({ data: { user: verifiedUser } }) => {
        if (!verifiedUser) {
          setUser(null)
          setRole(null)
          setLoading(false)
          setVerified(true)
          return
        }
        // Valid session confirmed — fetch full session for metadata
        return supabaseBrowser.auth.getSession()
          .then(({ data: { session } }) => resolveSession(session))
      })
      .catch(() => {
        setLoading(false)
        setVerified(true)
      })

    const listener = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      // Skip the first event — getUser() above is the authoritative source for
      // the initial session state. Trusting the cookie here (what INITIAL_SESSION
      // does) causes the same stale-token problem as getSession().
      if (event === 'INITIAL_SESSION') return
      resolveSession(session)
    })

    return () => listener.data.subscription.unsubscribe()
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
