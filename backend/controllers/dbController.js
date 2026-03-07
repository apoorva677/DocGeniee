const { supabaseAdmin } = require('../config/supabase');

/**
 * Get all generated documents for a user
 */
exports.getUserDocuments = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required.' });
        }

        const { data, error } = await supabaseAdmin
            .from('generated_documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, documents: data });

    } catch (error) {
        console.error('[Get Documents Error]:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get all custom templates for a user
 */
exports.getUserTemplates = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required.' });
        }

        const { data, error } = await supabaseAdmin
            .from('custom_templates')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, templates: data });

    } catch (error) {
        console.error('[Get Templates Error]:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
