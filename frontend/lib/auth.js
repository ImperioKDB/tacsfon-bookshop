import { supabaseBrowser } from '@/lib/supabase'

/**
 * Get the current session (client-side).
 * Returns null if no session exists.
 */
export async function getSession() {
  const { data: { session }, error } = await supabaseBrowser.auth.getSession()
  if (error) throw error
  return session
}

/**
 * Get the current user (client-side).
 * Returns null if not logged in.
 */
export async function getUser() {
  const { data: { user }, error } = await supabaseBrowser.auth.getUser()
  if (error) throw error
  return user
}

/**
 * Get the current user's role from the profiles table.
 * Returns 'student' by default if no profile row exists.
 */
export async function getUserRole(userId) {
  if (!userId) return null
  const { data, error } = await supabaseBrowser
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  if (error) return 'student' // fail-safe default
  return data?.role ?? 'student'
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabaseBrowser.auth.signOut()
  if (error) throw error
}

/**
 * Sign up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @param {string} fullName
 */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabaseBrowser.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
  if (error) throw error
  return data
}

/**
 * Sign in with email and password.
 * @param {string} email
 * @param {string} password
 */
export async function signInWithPassword(email, password) {
  const { data, error } = await supabaseBrowser.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

/**
 * Start Google OAuth flow.
 * Passes the current ?redirect param through as ?next so after
 * Google login the user lands where they intended, not always /products.
 * The redirect goes to /auth/callback which handles the code exchange.
 */
export async function signInWithGoogle() {
  // FIX: read the ?redirect param from the current URL (e.g. /login?redirect=/orders)
  // and forward it as ?next= so /auth/callback knows where to send the user after OAuth
  const currentRedirect =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect') || '/products'
      : '/products'

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentRedirect)}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(currentRedirect)}`

  const { data, error } = await supabaseBrowser.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) throw error
  return data
}

/**
 * Map Supabase auth errors to user-friendly messages.
 * Use this in catch blocks on auth forms.
 * @param {Error} error
 * @returns {string}
 */
export function getAuthErrorMessage(error) {
  const msg = error?.message?.toLowerCase() ?? ''

  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
    return 'Invalid email or password. Please check your details and try again.'
  }
  if (msg.includes('email already registered') || msg.includes('user already registered')) {
    return 'An account with this email already exists. Try logging in instead.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email before logging in. Check your inbox.'
  }
  if (msg.includes('password')) {
    return 'Password must be at least 8 characters long.'
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Connection error. Please check your internet and try again.'
  }
  return 'Something went wrong. Please try again.'
}

