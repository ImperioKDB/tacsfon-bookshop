'use client'
import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import { useAuth }             from '@/hooks/useAuth'
import { supabaseBrowser }     from '@/lib/supabase'
import { signOut }             from '@/lib/auth'
import { toastError, toastSuccess } from '@/components/ui/Toast'
import Spinner                 from '@/components/ui/spinner'

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-4 animate-pulse">
        <div className="skeleton h-8 w-32 rounded" />
        <div className="bg-white rounded-2xl border border-border/60 p-6 space-y-4">
          <div className="skeleton h-16 w-16 rounded-full" />
          <div className="skeleton h-5 w-48 rounded" />
          <div className="skeleton h-4 w-36 rounded" />
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [profile,    setProfile]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [editing,    setEditing]    = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [fullName,   setFullName]   = useState('')
  const [phone,      setPhone]      = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login?redirect=/profile'); return }
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  async function loadProfile() {
    try {
      const { data, error } = await supabaseBrowser
        .from('profiles')
        .select('id, full_name, phone, role, created_at')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        if (error.message?.toLowerCase().includes('jwt') || error.code === 'PGRST301') {
          router.push('/login?redirect=/profile')
          return
        }
      }

      const p = data ?? {
        id: user.id, full_name: user.user_metadata?.full_name ?? '',
        phone: '', role: 'student', created_at: user.created_at,
      }
      setProfile(p)
      setFullName(p.full_name ?? '')
      setPhone(p.phone ?? '')
    } catch {
      toastError('Could not load profile.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!fullName.trim()) { toastError('Name cannot be empty.'); return }
    setSaving(true)
    try {
      const { error } = await supabaseBrowser.from('profiles').upsert({
        id: user.id, full_name: fullName.trim(), phone: phone.trim(),
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      setProfile(p => ({ ...p, full_name: fullName.trim(), phone: phone.trim() }))
      toastSuccess('Profile updated!')
      setEditing(false)
    } catch {
      toastError('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleSignOut() {
    setSigningOut(true)
    signOut()
    window.location.href = '/'
  }

  if (authLoading || loading) return <ProfileSkeleton />

  const initial  = profile?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long' })
    : null

  return (
    <div className="min-h-screen bg-gray-50 page-enter">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account details</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-light border-2 border-primary/20
                            flex items-center justify-center text-primary font-bold text-2xl shrink-0">
              {initial}
            </div>
            <div>
              <p className="font-bold text-text-primary text-lg leading-tight">
                {profile?.full_name || 'No name set'}
              </p>
              <p className="text-text-secondary text-sm">{user?.email}</p>
              {joinDate && <p className="text-text-secondary text-xs mt-0.5">Member since {joinDate}</p>}
            </div>
          </div>

          {!editing ? (
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: profile?.full_name },
                { label: 'Email',     value: user?.email },
                { label: 'Phone',     value: profile?.phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                  <span className="text-sm text-text-secondary">{label}</span>
                  <span className="text-sm font-medium text-text-primary">
                    {value || <span className="text-text-secondary italic">Not set</span>}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-text-secondary">Role</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                  ${profile?.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text-secondary'}`}>
                  {profile?.role === 'admin' ? 'Admin' : 'Student'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                       placeholder="Your full name" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                       placeholder="e.g. 08012345678" className="input-field" />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="btn-secondary flex-1 text-sm" disabled={saving}>Cancel</button>
                <button onClick={handleSave}              className="btn-primary  flex-1 text-sm" disabled={saving}>
                  {saving ? <Spinner size="sm" color="white" /> : 'Save Changes'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-secondary flex-1 text-sm">Edit Profile</button>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-4 mb-4">
          {[{ label: 'My Orders', href: '/orders' }, { label: 'My Cart', href: '/cart' }].map(({ label, href }) => (
            <div key={href}>
              <Link href={href} className="flex items-center justify-between py-3 text-sm font-medium text-text-primary hover:text-primary transition-colors">
                <span>{label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
              {href === '/orders' && <div className="h-px bg-border" />}
            </div>
          ))}
        </div>

        <button onClick={handleSignOut} disabled={signingOut}
                className="w-full min-h-[48px] flex items-center justify-center rounded-full px-6 py-3
                           border-2 border-accent text-accent text-sm font-semibold
                           hover:bg-red-50 transition-all duration-200 disabled:opacity-50">
          {signingOut ? <Spinner size="sm" /> : 'Sign Out'}
        </button>

      </div>
    </div>
  )
}
