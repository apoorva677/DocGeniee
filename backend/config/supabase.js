const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials missing. Database features may not work.');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Standard client for client-side operations (respects RLS)
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client for backend operations (bypasses RLS)
const supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey) 
    : null;

module.exports = { supabase, supabaseAdmin };
