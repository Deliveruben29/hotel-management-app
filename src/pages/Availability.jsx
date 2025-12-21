import React, { useState } from 'react';
import { UNIT_GROUPS, UNITS, MOCK_RESERVATIONS } from '../data/mockData';

export default function Availability() {
    const [startDate, setStartDate] = useState(new Date('2025-12-21'));
    const daysToShow = 14;

    // Generate dates
    const dates = Array.from({ length: daysToShow }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return d;
    });

    // Helper to get available count
    const getAvailability = (groupId, date) => {
        // 1. Total units in this group
        const groupUnits = UNITS.filter(u => u.groupId === groupId);
        const totalCapacity = groupUnits.length; // Or use group.count from metadata

        // 2. Count occupied units
        // A unit is occupied if there is a reservation for it that spans this 'date'
        // Logic: Reservation Arrival <= Date < Reservation Departure

        let occupiedCount = 0;

        // Optimize: could map reservations to units first, but N is small here
        groupUnits.forEach(unit => {
            const isOccupied = MOCK_RESERVATIONS.some(res => {
                if (res.room !== unit.name) return false;

                const arrival = new Date(res.arrival);
                const departure = new Date(res.departure);
                const current = new Date(date);

                // Reset times to avoid timezone issues affecting direct comparison if mock data gives strings
                arrival.setHours(0, 0, 0, 0);
                departure.setHours(0, 0, 0, 0);
                current.setHours(0, 0, 0, 0);

                return current >= arrival && current < departure;
            });
            if (isOccupied) occupiedCount++;
        });

        return totalCapacity - occupiedCount;
    };

    const getCellColor = (count, total) => {
        if (count === 0) return '#FED7D7'; // Red/Sold out
        if (count <= 2) return '#FEEBC8'; // Orange/Low
        return '#C6F6D5'; // Green/Good
    };

    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <h1>Availability</h1>
                    <p className="subtitle">Real-time room availability overview.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn"
                        onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() - 7); setStartDate(d); }}
                        style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem' }}>
                        ← Prev
                    </button>
                    <span style={{ fontWeight: 600, minWidth: '120px', textAlign: 'center' }}>
                        {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <button className="btn"
                        onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() + 7); setStartDate(d); }}
                        style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem' }}>
                        Next →
                    </button>
                </div>
            </header>

            <div className="table-container" style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflowX: 'auto',
                border: '1px solid rgba(0,0,0,0.02)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
                            <th style={{ ...headerStyle, width: '250px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 10 }}>Unit Group</th>
                            <th style={{ ...headerStyle, width: '100px', textAlign: 'center' }}>Total</th>
                            {dates.map(d => (
                                <th key={d.toString()} style={{ ...headerStyle, textAlign: 'center', minWidth: '60px' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                    {d.getDate()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {UNIT_GROUPS.map(group => {
                            const total = UNITS.filter(u => u.groupId === group.id).length;
                            return (
                                <tr key={group.id} style={{ borderBottom: '1px solid #edf2f7' }} className="table-row-hover">
                                    <td style={{ ...cellStyle, fontWeight: 500, color: 'var(--color-text-main)', position: 'sticky', left: 0, background: 'white' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: group.color }}></div>
                                            {group.name}
                                        </div>
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'center', fontWeight: 600 }}>{total}</td>
                                    {dates.map((d, i) => {
                                        const avail = getAvailability(group.id, d);
                                        const bg = getCellColor(avail, total);
                                        return (
                                            <td key={i} style={{ padding: '0.5rem', borderRight: '1px solid #f7fafc', textAlign: 'center' }}>
                                                <div style={{
                                                    backgroundColor: bg,
                                                    padding: '0.5rem',
                                                    borderRadius: '4px',
                                                    fontWeight: 600,
                                                    color: 'var(--color-text-main)',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {avail}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                        {/* Summary Row */}
                        <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                            <td style={{ ...cellStyle, position: 'sticky', left: 0, background: '#f8fafc' }}>TOTAL AVAILABLE</td>
                            <td style={{ ...cellStyle, textAlign: 'center' }}>{UNITS.length}</td>
                            {dates.map((d, i) => {
                                let dayTotal = 0;
                                UNIT_GROUPS.forEach(g => {
                                    dayTotal += getAvailability(g.id, d);
                                });
                                return (
                                    <td key={i} style={{ ...cellStyle, textAlign: 'center', color: 'var(--color-primary)' }}>
                                        {dayTotal}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
            <style>{`
                .table-row-hover:hover {
                    background-color: var(--color-surface-hover);
                }
                .table-row-hover:hover td[style*="sticky"] {
                    background-color: var(--color-surface-hover) !important;
                }
            `}</style>
        </main>
    );
}

const headerStyle = {
    textAlign: 'left',
    padding: '1rem',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted)',
    fontWeight: 600
};

const cellStyle = {
    padding: '1rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem'
};
