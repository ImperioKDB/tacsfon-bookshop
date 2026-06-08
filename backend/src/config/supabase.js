'use strict';

const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

/**
 * supabaseAdmin  — service role key, bypasses RLS.
 *   Use for trusted server-side operations: order writes, stock updates,
 *   admin queries, storage uploads.
 *
 * supabaseAuth   — anon key, respects RLS.
 *   MUST be used in auth middleware to validate user Bearer tokens.
 *   The service role client ignores user JWTs — getUser() always returns
 *   null with a service role key, making every request appear unauthenticated
 *   and causing the app to redirect every logged-in user to signup.
 */
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Default export = admin client so existing service files need no changes.
module.exports = supabaseAdmin;
module.exports.supabaseAdmin = supabaseAdmin;
module.exports.supabaseAuth  = supabaseAuth;
