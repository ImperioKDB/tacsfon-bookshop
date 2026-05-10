'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { supabaseBrowser } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/spinner'
import { toastError, toastSuccess } from '@/components/ui/Toast'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 md:px-8 py-8 animate-pulse space-y-5">
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 flex flex-col items-center gap-3">
        <div className="skeleton w-20 h-20 rounded-full" />
        <div className="skeleton h-5 w-40 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5 space-y-4">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="skeleton h-12 w-full rounded-full" />
      </div>
    </div>
  )
}

// ── Password change section ───────────────────────────────────────────────────

function PasswordSection({ email }) {
  const [open,        setOpen]        = useState(false)
  const [currentPw,   setCurrentPw]   = useState('')
  const [newPw,       setNewPw]       = useState('')
  const [confirmPw,   setConfirmPw]   = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [errors,      setErrors]      = useState({})

  function reset() {
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    setErrors({})
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
  }

  function handleCancel() {
    reset()
    setOpen(false)
  }

  function validate() {
    const e = {}
    if (!currentPw)           e.currentPw  = 'Current password is required'
    if (newPw.length < 8)     e.newPw      = 'New password must be at least 8 characters'
    if (newPw !== confirmPw)  e.confirmPw  = 'Passwords do not match'
    if (newPw === currentPw)  e.newPw      = 'New password must be different from current'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setSaving(true)
    try {
      // Step 1: verify current password by re-authenticating
      const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password: currentPw,
      })
      if (authError) {
        setErrors({ currentPw: 'Current password is incorrect' })
        setSaving(false)
        return
      }

      // Step 2: update to new password
      const { error: updateError } = await supabaseBrowser.auth.updateUser({
        password: newPw,
      })
      if (updateError) throw updateError

      toastSuccess('Password updated successfully!')
      reset()
      setOpen(false)
    } catch {
      toastError('Failed to update password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Eye-toggle button shared across fields
  function EyeButton({ show, onToggle }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary
                   hover:text-text-primary transition-colors p-1"
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
          Password
        </p>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="text-xs font-semibold text-primary hover:underline underline-offset-2"
          >
            Change
          </button>
        )}
      </div>

      {!open ? (
        <p className="text-sm text-text-secondary">••••••••</p>
      ) : (
        <div className="space-y-4">

          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPw}
                onChange={e => { setCurrentPw(e.target.value); setErrors(ev => ({ ...ev, currentPw: '' })) }}
                placeholder="Your current password"
                autoComplete="current-password"
                className={`input-field pr-10 ${errors.currentPw ? 'border-red-400 focus:ring-red-300' : ''}`}
              />
              <EyeButton show={showCurrent} onToggle={() => setShowCurrent(s => !s)} />
            </div>
            {errors.currentPw && (
              <p className="text-xs text-accent mt-1">{errors.currentPw}</p>
            )}
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setErrors(ev => ({ ...ev, newPw: '' })) }}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className={`input-field pr-10 ${errors.newPw ? 'border-red-400 focus:ring-red-300' : ''}`}
              />
              <EyeButton show={showNew} onToggle={() => setShowNew(s => !s)} />
            </div>
            {errors.newPw && (
              <p className="text-xs text-accent mt-1">{errors.newPw}</p>
            )}
          </div>

          {/* Confirm new password */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setErrors(ev => ({ ...ev, confirmPw: '' })) }}
                placeholder="Repeat new password"
                autoComplete="new-password"
                className={`input-field pr-10 ${errors.confirmPw ? 'border-red-400 focus:ring-red-300' : ''}`}
              />
              <EyeButton show={showConfirm} onToggle={() => setShowConfirm(s => !s)} />
            </div>
            {errors.confirmPw && (
              <p className="text-xs text-accent mt-1">{errors.confirmPw}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="btn-secondary flex-1 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex-1 text-sm"
            >
              {saving ? <Spinner size="sm" color="white" /> : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [profile,    setProfile]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [editing,    setEditing]    = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // Editable fields
  const [fullName, setFullName] = useState('')
  const [phone,    setPhone]    = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login?redirect=/profile')
      return
    }
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  async function loadProfile() {
    try {
      const { data, error } = await supabaseBrowser
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no row found

      const p = data ?? { id: user.id, full_name: user.user_metadata?.full_name ?? '', phone: '' }
      setProfile(p)
      setFullName(p.full_name ?? '')
      setPhone(p.phone ?? '')
    } catch {
      toastError('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!fullName.trim()) {
      toastError('Full name cannot be empty.')
      return
    }
    setSaving(true)
    try {
      const updates = {
        id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabaseBrowser
        .from('profiles')
        .upsert(updates)

      if (error) throw error

      setProfile(prev => ({ ...prev, ...updates }))
      setEditing(false)
      toastSuccess('Profile updated!')
    } catch {
      toastError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setFullName(profile?.full_name ?? '')
    setPhone(profile?.phone ?? '')
    setEditing(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      router.push('/login')
    } catch {
      toastError('Sign out failed. Please try again.')
      setSigningOut(false)
    }
  }

  if (loading || authLoading) return <ProfileSkeleton />
  if (!user) return null

  const displayName = profile?.full_name || user.user_metadata?.full_name || 'Student'
  const email       = user.email ?? ''
  const joinedAt    = profile?.created_at ?? user.created_at

  // Google OAuth users don't have a password to change
  const isPasswordUser = user.app_metadata?.provider === 'email'

  return (
    <div className="page-enter min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 md:px-8 py-8 space-y-4">

        {/* ── Avatar + name card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 flex flex-col items-center text-center">

          {/* Avatar circle */}
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4 shadow-sm">
            <span className="text-2xl font-bold text-white">
              {getInitials(displayName)}
            </span>
          </div>

          <h1 className="text-xl font-bold text-text-primary">{displayName}</h1>
          <p className="text-sm text-text-secondary mt-0.5">{email}</p>
          <p className="text-xs text-text-secondary mt-3 bg-gray-50 px-3 py-1.5 rounded-full border border-border/50">
            Member since {formatDate(joinedAt)}
          </p>

          {/* Quick links */}
          <div className="flex gap-3 mt-5 w-full">
            <Link
              href="/orders"
              className="flex-1 flex flex-col items-center gap-1 py-3 px-2 bg-primary-light
                         rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors"
            >
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-semibold text-primary">My Orders</span>
            </Link>
            <Link
              href="/products"
              className="flex-1 flex flex-col items-center gap-1 py-3 px-2 bg-gray-50
                         rounded-xl border border-border/60 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-semibold text-text-secondary">Shop</span>
            </Link>
          </div>
        </div>

        {/* ── Edit profile card ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
              Account Details
            </p>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-semibold text-primary hover:underline underline-offset-2"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                autoComplete="tel"
              />

              {/* Read-only email */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Email Address
                </label>
                <div className="input-field bg-gray-50 text-text-secondary cursor-not-allowed select-none">
                  {email}
                </div>
                <p className="text-xs text-text-secondary mt-1">Email cannot be changed here.</p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn-secondary flex-1 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1 text-sm"
                >
                  {saving ? <Spinner size="sm" className="text-white" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {[
                { label: 'Full Name', value: profile?.full_name || '—' },
                { label: 'Phone',     value: profile?.phone     || '—' },
                { label: 'Email',     value: email              || '—' },
                { label: 'Role',      value: profile?.role === 'admin' ? '👑 Admin' : '🎓 Student' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
                  <span className="text-xs font-medium text-text-secondary shrink-0">{label}</span>
                  <span className="text-sm text-text-primary text-right">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Password card (email/password users only) ────────────────────── */}
        {isPasswordUser && <PasswordSection email={email} />}

        {/* ── Sign out ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-5">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
            Account Actions
          </p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                       border border-red-200 text-accent text-sm font-semibold
                       hover:bg-red-50 disabled:opacity-50 transition-all duration-200"
          >
            {signingOut ? (
              <Spinner size="sm" className="text-accent" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
