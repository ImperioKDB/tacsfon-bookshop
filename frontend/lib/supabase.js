import { createBrowserClient } from '@supabase/ssr'

let _client = null

export function getSupabaseBrowser() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
        },
      }
    )
  }
  return _client
}

export const supabaseBrowser = getSupabaseBrowser()
