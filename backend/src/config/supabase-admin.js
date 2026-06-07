'use strict';

// Backward-compat: existing service files import supabase directly.
// They all need the admin (service role) client to bypass RLS for
// trusted server-side writes. Re-export just the admin client as default.
const { supabaseAdmin } = require('./supabase');
module.exports = supabaseAdmin;
