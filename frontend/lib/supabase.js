import { createBrowserClient } from '@supabase/ssr'

// Singleton — one shared instance across the entire app.
// Prevents multiple listeners and session sync issues.
let _client = null

export function getSupabaseBrowser() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return _client
}

// Named export so existing imports (Navbar, etc.) still work unchanged
export const supabaseBrowser = getSupabaseBrowser()
