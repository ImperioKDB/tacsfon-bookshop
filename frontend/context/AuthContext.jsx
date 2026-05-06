'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch role from profiles table
  async function fetchRole(userId) {
    if (!userId) return 'student'
    const { data, error } = await supabaseBrowser
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error || !data?.role) return 'student' // fail-safe default
    return data.role
  }

  useEffect(() => {
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
