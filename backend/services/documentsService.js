const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const documentsService = {
    async getAllDocuments() {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async getDocumentById(id) {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    async saveDocument(docData) {
        const { data, error } = await supabase
            .from('documents')
            .insert([{
                title: docData.title,
                content: docData.content,
                type: docData.type,
                source: docData.source,
                created_at: new Date()
            }])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async deleteDocument(id) {
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },

    async updateDocument(id, updates) {
        const { data, error } = await supabase
            .from('documents')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    }
};

module.exports = documentsService;
