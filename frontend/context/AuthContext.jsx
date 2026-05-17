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
    async function init() {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession()
        const u = session?.user ?? null
        setUser(u)
        setRole(u ? await getUserRole(u.id).catch(() => null) : null)
      } catch {
        setUser(null)
        setRole(null)
      }
      // Outside the try/catch — this line ALWAYS runs no matter what
      setLoading(false)
    }

    init()

    // Keep in sync on login / logout / token refresh
    let unsubscribe = () => {}
    try {
      const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
        async (_, session) => {
          try {
            const u = session?.user ?? null
            setUser(u)
            setRole(u ? await getUserRole(u.id).catch(() => null) : null)
          } catch {
            setRole(null)
          }
          setLoading(false)
        }
      )
      unsubscribe = () => subscription.unsubscribe()
    } catch {}

    return unsubscribe
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
