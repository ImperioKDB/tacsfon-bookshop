import { supabaseBrowser } from '@/lib/supabase'

export async function getSession() {
  const { data: { session }, error } = await supabaseBrowser.auth.getSession()
  if (error) throw error
  return session
}

export async function getUser() {
  const { data: { user }, error } = await supabaseBrowser.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserRole(userId) {
  if (!userId) return null
  const { data, error } = await supabaseBrowser
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  if (error) return 'student'
  return data?.role ?? 'student'
}

export async function signOut() {
  // Clear local session first — works even if server session is expired
  await supabaseBrowser.auth.signOut({ scope: 'local' }).catch(() => {})
  // Then attempt server-side signout (non-fatal if it fails)
  await supabaseBrowser.auth.signOut().catch(() => {})
}

export async function signUp(email, password, fullName) {
  const { data, error } = await supabaseBrowser.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw error
  return data
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabaseBrowser.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const currentRedirect =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect') || '/products'
      : '/products'

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentRedirect)}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(currentRedirect)}`

  // Clear any stale local session / PKCE verifier from previous attempts
  // before starting a fresh OAuth flow — prevents "flow state not found" errors
  await supabaseBrowser.auth.signOut({ scope: 'local' }).catch(() => {})

  const { data, error } = await supabaseBrowser.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) throw error
  return data
}

export function getAuthErrorMessage(error) {
  const msg = error?.message?.toLowerCase() ?? ''
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
    return 'Invalid email or password. Please check your details and try again.'
  }
  if (msg.includes('email already registered') || msg.includes('user already registered')) {
    return 'An account with this email already exists. Try logging in instead.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Please check your email and confirm your account before signing in.'
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  return 'Something went wrong. Please try again.'
}
