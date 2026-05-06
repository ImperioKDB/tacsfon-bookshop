'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { signInWithPassword, signInWithGoogle, getAuthErrorMessage } from '@/lib/auth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { toastError, toastSuccess } from '@/components/ui/Toast'
import Spinner from '@/components/ui/spinner'

export default function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const redirect = searchParams.get('redirect') || '/products'

  // ✅ FIX: move redirect into useEffect (important)
  useEffect(() => {
    if (user) {
      router.push(redirect)
    }
  }, [user, redirect, router])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email || !password) {
      toastError('Please fill in all fields')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toastError('Please enter a valid email')
      return
    }

    setLoading(true)
    try {
      await signInWithPassword(email, password)
      toastSuccess('Welcome back! 🎉')
      router.push(redirect)
    } catch (error) {
      toastError(getAuthErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle()
    } catch (error) {
      toastError(getAuthErrorMessage(error))
    }
  }

  return (
    <div className="page-enter min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* (your JSX remains unchanged) */}
    </div>
  )
}
