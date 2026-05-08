'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [role, setRole]       = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchRole(userId) {
    if (!userId) return 'student'
    // Retry up to 3 times — Google OAuth can have a brief delay
    // before the trigger creates the profile row
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data, error } = await supabaseBrowser
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()

        if (!error && data?.role) return data.role

        // Profile row not ready yet — wait before retrying
        if (attempt < 3) {
          await new Promise(res => setTimeout(res, attempt * 500))
        }
      } catch {
        // Network error or unexpected crash — never let this take down the app
        if (attempt === 3) return 'student'
        await new Promise(res => setTimeout(res, attempt * 500))
      }
    }
    return 'student' // safe default after all retries exhausted
  }

  useEffect(() => {
    // Initial session check
    supabaseBrowser.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const userRole = await fetchRole(currentUser.id)
        setRole(userRole)
      }
      setLoading(false)
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const userRole = await fetchRole(currentUser.id)
          setRole(userRole)
        } else {
          setRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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
