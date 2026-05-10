'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase'
import { getUserRole } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [role,    setRole]    = useState(null)
  const [loading, setLoading] = useState(true)

  const resolveSession = useCallback(async (session) => {
    if (!session?.user) {
      setUser(null)
      setRole(null)
      // FIX: mark loading done immediately — no DB call needed for logged-out state
      setLoading(false)
      return
    }

    // FIX: set user and mark loading DONE first so the navbar renders immediately.
    // Then fetch the role in the background — role arriving slightly later is fine.
    setUser(session.user)
    setLoading(false)

    // Role from JWT metadata is instant — use it as a fast initial value
    const metaRole = session.user?.user_metadata?.role
    if (metaRole) setRole(metaRole)

    // Then confirm from the profiles table (source of truth)
    try {
      const fetchedRole = await getUserRole(session.user.id)
      setRole(fetchedRole)
    } catch {
      // Keep the metadata role if the DB call fails
      if (!metaRole) setRole('student')
    }
  }, [])

  useEffect(() => {
    // Hydrate on mount
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      resolveSession(session)
    }).catch(() => {
      // If getSession itself fails, unblock the UI
      setLoading(false)
    })

    // Stay in sync with all future auth events
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        resolveSession(session)
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
