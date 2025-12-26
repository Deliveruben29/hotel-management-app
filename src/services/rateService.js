import { supabase } from '../lib/supabase';

export const RateService = {
    // Fetch all rate plans
    async getAll() {
        const { data, error } = await supabase
            .from('rate_plans')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Map snake_case database columns to camelCase for the app
        return data.map(item => ({
            id: item.id,
            name: item.name,
            code: item.code,
            cancellationPolicy: item.cancellation_policy,
            basePrice: item.base_price,
            description: item.description,
            currency: item.currency
        }));
    },

    // Create a new rate plan
    async create(plan) {
        const dbPayload = {
            id: plan.id,
            name: plan.name,
            code: plan.code,
            cancellation_policy: plan.cancellationPolicy,
            base_price: plan.basePrice,
            description: plan.description,
            currency: plan.currency
        };

        const { data, error } = await supabase
            .from('rate_plans')
            .insert([dbPayload])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update an existing rate plan
    async update(id, updates) {
        const dbPayload = {};
        if (updates.name !== undefined) dbPayload.name = updates.name;
        if (updates.code !== undefined) dbPayload.code = updates.code;
        if (updates.cancellationPolicy !== undefined) dbPayload.cancellation_policy = updates.cancellationPolicy;
        if (updates.basePrice !== undefined) dbPayload.base_price = updates.basePrice;
        if (updates.description !== undefined) dbPayload.description = updates.description;
        if (updates.currency !== undefined) dbPayload.currency = updates.currency;

        const { error } = await supabase
            .from('rate_plans')
            .update(dbPayload)
            .eq('id', id);

        if (error) throw error;
    },

    // Delete a rate plan
    async delete(id) {
        const { error } = await supabase
            .from('rate_plans')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getDailyRates(startDate, endDate) {
        const { data, error } = await supabase
            .from('daily_rates')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;

        return data.map(r => ({
            id: r.id,
            date: r.date,
            groupId: r.unit_group_id,
            price: Number(r.base_price)
        }));
    },

    async upsertDailyRate(rateData) {
        const { error } = await supabase
            .from('daily_rates')
            .upsert({
                date: rateData.date,
                unit_group_id: rateData.groupId,
                base_price: rateData.price,
                currency: 'CHF'
            }, { onConflict: 'date,unit_group_id' });

        if (error) throw error;
    }
};
