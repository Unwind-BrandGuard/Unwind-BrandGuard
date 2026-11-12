
const { createClient } = require('@supabase/supabase-js');

async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        message: 'Backend Supabase configuration is missing.',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        message: 'Your session is invalid or expired. Please sign in again.',
      });
    }

    req.user = data.user;
    req.supabase = supabase;

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Unable to authenticate this request.',
    });
  }
}

module.exports = { authenticateUser };