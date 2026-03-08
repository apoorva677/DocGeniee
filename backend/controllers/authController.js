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

        // SignUp with Supabase
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: { full_name: name.trim() }
            }
        });

        if (error) {
            console.error('[Supabase Signup Error]:', error.message);
            return res.status(400).json({ success: false, error: error.message });
        }

        const user = data.user;
        console.log(`[Auth] Supabase signup successful: ${user.email}`);

        return res.status(201).json({
            success: true,
            message: 'Account created successfully. Please check your email for verification if enabled.',
            user: { 
                id: user.id, 
                name: user.user_metadata?.full_name || name, 
                email: user.email,
                created_at: user.created_at,
                user_metadata: user.user_metadata
            }
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

        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
        });

        if (error) {
            console.error('[Supabase Login Error]:', error.message);
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        const user = data.user;
        console.log(`[Auth] Supabase login successful: ${user.email}`);

        return res.json({
            success: true,
            message: 'Login successful.',
            session: data.session,
            user: { 
                id: user.id, 
                name: user.user_metadata?.full_name || 'User', 
                email: user.email,
                created_at: user.created_at,
                user_metadata: user.user_metadata
            }
        });

    } catch (err) {
        console.error('[Auth Login Error]:', err.message);
        return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
    }
};
