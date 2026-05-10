'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { getUserRole } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null)
  const [role,     setRole]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  // verified = true means we've confirmed the session with Supabase's server,
  // not just read a cookie. LoginContent waits for this before redirecting.
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

    // Fast role from JWT metadata
    const metaRole = session.user?.user_metadata?.role
    if (metaRole) setRole(metaRole)

    // Confirm from profiles table in background
    try {
      const fetchedRole = await getUserRole(session.user.id)
      setRole(fetchedRole)
    } catch {
      if (!metaRole) setRole('student')
    }

    setVerified(true)
  }, [])

  useEffect(() => {
    // Use getUser() to verify with Supabase server — not just the cookie.
    // This prevents stale sessions from triggering redirects in LoginContent.
    supabaseBrowser.auth.getUser().then(({ data: { user: verifiedUser } }) => {
      if (!verifiedUser) {
        // No valid session — clear everything and unblock
        setUser(null)
        setRole(null)
        setLoading(false)
        setVerified(true)
        return
      }
      // Valid session confirmed — now get full session object for metadata
      supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
        resolveSession(session)
      })
    }).catch(() => {
      setLoading(false)
      setVerified(true)
    })

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (event, session) => {
        // Skip the initial event — getUser() above is the authoritative
        // server-verified source for the initial session state.
        // Trusting the cookie here causes a stale-session redirect to /products
        // when an unauthenticated user visits /login or /signup.
        if (event === 'INITIAL_SESSION') return
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

