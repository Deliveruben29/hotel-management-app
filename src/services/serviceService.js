import { supabase } from '../lib/supabase';

export const ServiceService = {
    async getAll() {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async create(service) {
        const { data, error } = await supabase
            .from('services')
            .insert([{
                name: service.name,
                price: parseFloat(service.price),
                type: service.type,
                vat_rate: service.vat_rate || 0.081,
                description: service.description
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('services')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
