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
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()

  const redirect = searchParams.get('redirect') || '/products'

  // Redirect if already logged in and verified
  useEffect(() => {
    if (verified && user) router.replace(redirect)
  }, [user, loading, redirect, router])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      toastError('Please fill in all fields'); return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toastError('Please enter a valid email'); return
    }
    setLoading(true)
    try {
      await signInWithPassword(email, password)
      toastSuccess('Welcome back! 🎉')
      router.replace(redirect)
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

  // No loading gate — always show the form immediately.
  // If the user is already logged in, the useEffect above handles the redirect.
  // A brief flash of the form for logged-in users is acceptable and
  // far better than a blank/spinner screen for logged-out users.
  return (
    <div className="min-h-screen bg-primary-muted flex items-center justify-center px-4 py-10 page-enter">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-extrabold text-primary tracking-tight">
              TACSFON Bookshop
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="auth-card">

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-text-primary">Welcome back</h1>
            <p className="text-text-secondary text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border-2 border-border
                       rounded-xl py-3 px-4 text-text-primary font-semibold text-sm
                       hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                       min-h-[48px] mb-5">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-secondary font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email Address" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" required />

            <div className="relative">
              <Input label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-text-secondary
                           hover:text-text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <Button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
              {loading ? <Spinner size="sm" color="white" /> : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup"
                className="text-primary font-semibold hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}
