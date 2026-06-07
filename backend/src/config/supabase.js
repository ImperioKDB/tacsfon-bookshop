'use strict';

const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

/**
 * supabaseAdmin  — service role key, bypasses RLS.
 *                  Use only for trusted server operations (order writes,
 *                  stock updates, admin queries, storage uploads).
 *
 * supabaseAuth   — anon key, respects RLS.
 *                  MUST be used in auth middleware to validate user JWTs.
 *                  The service role client ignores user Bearer tokens —
 *                  getUser() always returns null with a service role key,
 *                  making every user request appear unauthenticated.
 */
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = { supabaseAdmin, supabaseAuth };
