import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern — one client instance shared across the entire app.
// Without this, createBrowserClient creates a new instance per import,
// which means onAuthStateChange listeners don't share state and the
// session is not propagated correctly after OAuth redirects.
let client = null

export function getSupabaseBrowser() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return client
}

// Keep named export for backward compatibility with existing imports
export const supabaseBrowser = getSupabaseBrowser()
