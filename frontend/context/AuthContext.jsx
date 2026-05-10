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
    supabaseBrowser.auth.getSession
