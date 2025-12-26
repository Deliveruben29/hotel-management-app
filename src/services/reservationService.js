import { supabase } from '../lib/supabase';

export const ReservationService = {
    async getAll() {
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .order('arrival', { ascending: true }); // Order by arrival date

        if (error) {
            console.error('Error fetching reservations:', error);
            return [];
        }

        return data.map(row => ({
            ...row.data, // Spread the JSON blob first
            // Overwrite with top-level columns to ensure sync
            id: row.id,
            status: row.status,
            arrival: row.arrival,
            departure: row.departure,
            guestName: row.guest_name,
            email: row.email,
            phone: row.phone,
            price: row.total_amount, // Map db 'total_amount' to app 'price' if needed, or keep consistent
            room: row.unit_id
        }));
    },

    async create(reservation) {
        // payload for JSON column (everything else)
        // We can just dump the whole reservation object into json for safety

        const dbPayload = {
            id: reservation.id,
            status: reservation.status,
            arrival: reservation.arrival,
            departure: reservation.departure,
            guest_name: reservation.guestName,
            email: reservation.email,
            phone: reservation.phone,
            unit_id: reservation.room || null,
            total_amount: reservation.price || 0,
            currency: reservation.currency || 'CHF',
            data: reservation // Store the full object as JSON source of truth
        };

        const { data, error } = await supabase
            .from('reservations')
            .insert([dbPayload])
            .select()
            .single();

        if (error) throw error;
        return {
            ...data.data,
            id: data.id,
            status: data.status,
            guestName: data.guest_name
        };
    },

    async update(reservation) {
        const dbPayload = {
            status: reservation.status,
            arrival: reservation.arrival,
            departure: reservation.departure,
            guest_name: reservation.guestName,
            email: reservation.email,
            phone: reservation.phone,
            unit_id: reservation.room || null,
            total_amount: reservation.price || 0,
            currency: reservation.currency || 'CHF',
            data: reservation
        };

        const { data, error } = await supabase
            .from('reservations')
            .update(dbPayload)
            .eq('id', reservation.id)
            .select()
            .single();

        if (error) throw error;
        return {
            ...data.data,
            id: data.id
        };
    },

    // For updating specific fields without sending whole object
    async updateStatus(id, status) {
        // We need to fetch current first to update the 'data' blob too? 
        // Or just update the column? 
        // Ideally both. For now, let's assume update() is used for everything.
        // But for status change:
        const { error } = await supabase
            .from('reservations')
            .update({ status: status }) // Updates column
            .eq('id', id);

        // Note: The 'data' blob status might become stale if we don't update it. 
        // Simpler to rely on update(fullObj).
        if (error) throw error;
    }
};
