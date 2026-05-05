'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      // Phase 2: fetch role from profiles table here
      setRole(session ? 'student' : null) 
      setLoading(false)
    })

    // Initial session check
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setRole(session ? 'student' : null)
      setLoading(false)
    })

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
