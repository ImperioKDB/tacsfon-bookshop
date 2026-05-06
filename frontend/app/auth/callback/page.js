'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'
import Spinner from '@/components/ui/spinner'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Supabase SSR client handles the code exchange automatically
    // Just wait for session to be set, then redirect
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/products')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <Spinner size="xl" />
      <p className="text-text-secondary">Completing sign in...</p>
    </div>
  )
    }
