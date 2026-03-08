const { supabaseAdmin } = require('../config/supabase');

/**
 * GET /api/profile
 */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User ID required.' });
        }

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            throw error;
        }

        res.json({ success: true, profile: data || {} });

    } catch (error) {
        console.error('[Profile Controller Get Error]:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { fullName, phone, professionalTitle, settings } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User ID required.' });
        }

        const profileData = {
            id: userId,
            full_name: fullName,
            phone,
            professional_title: professionalTitle,
            settings: settings || {},
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .upsert(profileData)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, profile: data });

    } catch (error) {
        console.error('[Profile Controller Update Error]:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
