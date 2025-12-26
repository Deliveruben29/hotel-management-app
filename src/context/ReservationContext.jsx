import React, { createContext, useContext, useState, useEffect } from 'react';
import { ReservationService } from '../services/reservationService';
import { MOCK_RESERVATIONS as INITIAL_DATA } from '../data/mockData';

const ReservationContext = createContext();

export const useReservations = () => {
    return useContext(ReservationContext);
};

export const ReservationProvider = ({ children }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadReservations = async () => {
        try {
            setLoading(true);
            const data = await ReservationService.getAll();

            if (data.length === 0) {
                // Seed database if empty
                console.log('Seeding reservations database...');
                const seededData = [];
                for (const res of INITIAL_DATA) {
                    try {
                        const newRes = await ReservationService.create(res);
                        seededData.push(newRes);
                    } catch (err) {
                        console.error("Error seeding reservation:", res.id, err);
                    }
                }
                setReservations(seededData);
            } else {
                setReservations(data);
            }
        } catch (error) {
            console.error('Failed to load reservations:', error);
            // Fallback to empty or initial data in worse case? 
            // Better to show empty so user knows DB is down, but for dev UX...
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReservations();
    }, []);

    const addReservation = async (reservation) => {
        try {
            const newRes = await ReservationService.create(reservation);
            setReservations(prev => [...prev, newRes]);
        } catch (error) {
            console.error('Failed to add reservation:', error);
            throw error;
        }
    };

    const updateReservationStatus = async (id, newStatus) => {
        try {
            await ReservationService.updateStatus(id, newStatus);
            // Optimistic or re-fetch
            const updated = reservations.map(res =>
                res.id === id ? { ...res, status: newStatus } : res
            );
            setReservations(updated);
            // Theoretically we should re-fetch to sync 'data' column if we care about consistency
            // but for UI responsiveness this is fine. 
        } catch (error) {
            console.error('Failed to update status:', error);
            throw error;
        }
    };

    const updateReservation = async (updatedRes) => {
        try {
            const result = await ReservationService.update(updatedRes);
            const updatedList = reservations.map(res =>
                res.id === updatedRes.id ? result : res
            );
            setReservations(updatedList);
        } catch (error) {
            console.error('Failed to update reservation:', error);
            throw error;
        }
    };

    return (
        <ReservationContext.Provider value={{
            reservations,
            loading,
            addReservation,
            updateReservationStatus,
            updateReservation,
            refresh: loadReservations
        }}>
            {children}
        </ReservationContext.Provider>
    );
};
