'use strict';

const { supabaseAuth } = require('../config/supabase');
const { error }        = require('../utils/apiResponse');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 401, 'UNAUTHORIZED', 'Missing or invalid authorization token');
    }

    const token = authHeader.split(' ')[1];

    // supabaseAuth uses the anon key — required to validate user Bearer tokens.
    // A service-role client returns null for getUser() with any user JWT.
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return error(res, 401, 'TOKEN_EXPIRED', 'Invalid or expired token');
    }

    req.user = {
      id:    user.id,
      email: user.email,
      role:  user.user_metadata?.role || 'student',
    };
    next();
  } catch (err) {
    next(err);
  }
};
