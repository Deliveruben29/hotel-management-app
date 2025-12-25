import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_RESERVATIONS as INITIAL_DATA } from '../data/mockData';

const ReservationContext = createContext();

export const useReservations = () => {
    return useContext(ReservationContext);
};

export const ReservationProvider = ({ children }) => {
    // Initialize state only once
    const [reservations, setReservations] = useState(INITIAL_DATA);

    // Clear corrupted data/Reset on reload for this session to fix user issue
    useEffect(() => {
        try {
            const stored = localStorage.getItem('app_reservations');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setReservations(parsed);
                } else {
                    setReservations(INITIAL_DATA); // Fallback if data is corrupted
                }
            } else {
                setReservations(INITIAL_DATA);
            }
        } catch (e) {
            console.error("Failed to parse reservations:", e);
            setReservations(INITIAL_DATA);
        }
    }, []);

    const saveReservations = (newRes) => {
        setReservations(newRes);
        localStorage.setItem('app_reservations', JSON.stringify(newRes));
    };

    const addReservation = (reservation) => {
        const newRes = [...reservations, reservation];
        saveReservations(newRes);
    };

    const updateReservationStatus = (id, newStatus) => {
        const updated = reservations.map(res =>
            res.id === id ? { ...res, status: newStatus } : res
        );
        saveReservations(updated);
    };

    const updateReservation = (updatedRes) => {
        const updated = reservations.map(res =>
            res.id === updatedRes.id ? updatedRes : res
        );
        saveReservations(updated);
    };

    return (
        <ReservationContext.Provider value={{
            reservations,
            addReservation,
            updateReservationStatus,
            updateReservation
        }}>
            {children}
        </ReservationContext.Provider>
    );
};
