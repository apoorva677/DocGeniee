const { supabase } = require('../config/supabase');

/**
 * POST /api/auth/signup
 * Body: { name, email, password }
 */
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
        }

        // Supabase Auth Signup
        const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password: password,
            options: {
                data: {
                    full_name: name.trim()
                }
            }
        });

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        console.log(`[Auth] New user registered via Supabase: ${email}`);

        // Note: The SQL trigger in Supabase will automatically create a row in the public.profiles table
        return res.status(201).json({
            success: true,
            message: 'Account created successfully. Please check your email for verification (if enabled) or log in.',
            user: data.user
        });

    } catch (err) {
        console.error('[Auth Signup Error]:', err);
        return res.status(500).json({ success: false, error: 'Signup failed. Please try again.' });
    }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        // Supabase Auth Login
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password
        });

        if (error) {
            return res.status(401).json({ success: false, error: error.message });
        }

        console.log(`[Auth] Login successful via Supabase: ${email}`);

        return res.json({
            success: true,
            message: 'Login successful.',
            session: data.session,
            user: data.user
        });

    } catch (err) {
        console.error('[Auth Login Error]:', err);
        return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
    }
};
