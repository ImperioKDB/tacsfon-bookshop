'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { getUserRole } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [role, setRole]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Resolves a session → sets user + fetches real role from profiles table
  const resolveSession = useCallback(async (session) => {
    if (!session?.user) {
      setUser(null)
      setRole(null)
      return
    }
    setUser(session.user)
    const fetchedRole = await getUserRole(session.user.id)
    setRole(fetchedRole)
  }, [])

  useEffect(() => {
    // 1. Hydrate on mount — avoids flash of unauthenticated state
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      resolveSession(session).finally(() => setLoading(false))
    })

    // 2. Stay in sync with all future auth events
    //    (login, logout, token refresh, OAuth callback)
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        resolveSession(session).finally(() => setLoading(false))
      }
    )

    return () => subscription.unsubscribe()
  }, [resolveSession])

  return (
    <AuthContext.Provider value={{ user, role, loading, setUser, setRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
