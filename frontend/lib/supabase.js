import { createBrowserClient } from '@supabase/ssr'

let _client = null

export function getSupabaseBrowser() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          // MUST be false — if true, supabaseBrowser auto-exchanges the OAuth
          // code on every page load, consuming it before auth/callback/page.js
          // can do it, causing "flow state not found" and a redirect to /login.
          detectSessionInUrl: false,
        },
      }
    )
  }
  return _client
}

export const supabaseBrowser = getSupabaseBrowser()
