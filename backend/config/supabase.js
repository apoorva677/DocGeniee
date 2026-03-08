const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    console.error('[Supabase Config]: Missing environment variables!');
}

// Client for general operations (anon)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Administrative client (service role) for privileged operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = {
    supabase,
    supabaseAdmin
};
