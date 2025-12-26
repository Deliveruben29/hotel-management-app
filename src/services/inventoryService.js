import { supabase } from '../lib/supabase';

export const InventoryService = {
    // --- Unit Groups ---

    async getUnitGroups() {
        const { data, error } = await supabase
            .from('unit_groups')
            .select('*')
            .order('rank', { ascending: true });

        if (error) throw error;
        return data.map(g => ({
            id: g.id,
            code: g.code,
            name: g.name,
            color: g.color || '#ccc',
            occupancy: g.occupancy,
            rank: g.rank,
            count: 0 // Will need to be calculated via join or separate query if needed, often count of units
        }));
    },

    async createUnitGroup(group) {
        const payload = {
            id: group.id,
            code: group.code,
            name: group.name,
            color: group.color,
            occupancy: group.occupancy,
            rank: group.rank
        };
        const { error } = await supabase.from('unit_groups').insert([payload]);
        if (error) throw error;
        return payload;
    },

    // --- Units ---

    async getUnits() {
        const { data, error } = await supabase
            .from('units')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data.map(u => ({
            id: u.id,
            name: u.name,
            groupId: u.group_id,
            condition: u.condition,
            attributes: u.attributes || []
        }));
    },

    async createUnit(unit) {
        const payload = {
            id: unit.id,
            name: unit.name,
            group_id: unit.groupId,
            condition: unit.condition,
            attributes: unit.attributes
        };
        const { error } = await supabase.from('units').insert([payload]);
        if (error) throw error;
        return payload;
    },

    async updateUnit(id, updates) {
        const payload = {};
        if (updates.condition) payload.condition = updates.condition;
        // Add other fields as needed mapping camelCase to snake_case

        const { data, error } = await supabase
            .from('units')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            name: data.name,
            groupId: data.group_id,
            condition: data.condition,
            attributes: data.attributes || []
        };
    }
};
