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
        // Updated Logic: Match the solid block style regardless of count, 
        // using color to indicate Occupancy level is optional in Apaleo.
        // But for this request, I will keep the useful RAG status but styled more like blocks
        if (count === 0) return '#FED7D7'; // Red/Sold out
        if (count <= 2) return '#FEEBC8'; // Orange/Low
        return '#C6F6D5'; // Green/Good
    };

    // Apaleo-style block colors based on row index or group?
    // The image shows consistent colors per row. Let's try to mimic that "solid block" look.
    const getBlockColor = (groupId, count) => {
        // If 0, always red to warn? Or just plain style?
        // Image shows:
        // Row 1 (Blue): 10, 10...
        // Row 3 (Green): 10, 9...
        // Row 4 (Red): 10, 10... (Maybe this is a specific type or sold out?)

        // Let's stick to the functional RAG for now as user said "The rest is beautiful", 
        // but let's make the SHAPE distinct rectangles like the screenshot.

        if (count === 0) return '#fc8181'; // distinct red
        // Return a light shade for background
        const groupIndex = UNIT_GROUPS.findIndex(g => g.id === groupId);
        const shades = ['#bee3f8', '#d6bcfa', '#c6f6d5', '#fed7d7', '#fefcbf', '#b2f5ea'];
        return shades[groupIndex % shades.length];
    };

    return (
        <main className="dashboard-view fade-in">
            <header className="view-header" style={{ marginBottom: '0.5rem' }}>
                <div>
                    {/* Breadcrumbs simulation */}
                    <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ color: '#718096' }}>Jezebel Hotel Rhein</span> <span style={{ background: '#FED7D7', padding: '2px 4px', borderRadius: '4px' }}>Test</span>
                    </div>
                    <h1>Availability</h1>
                </div>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <div style={{ padding: '0.5rem 0', color: '#F6AD55', borderBottom: '2px solid #F6AD55', fontWeight: 600, cursor: 'pointer' }}>Unit groups</div>
                <div style={{ padding: '0.5rem 0', color: '#718096', fontWeight: 500, cursor: 'pointer' }}>Services</div>
            </div>

            {/* Date Controls - The User's Specific Request */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>From</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() - 14); setStartDate(d); }}
                        style={navBtnStyle}
                    >«</button>
                    <button
                        onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() - 7); setStartDate(d); }}
                        style={navBtnStyle}
                    >‹</button>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="text" // using text to mimic the display "21/12/2025"
                            value={startDate.toLocaleDateString('en-GB')} // DD/MM/YYYY
                            readOnly
                            style={{
                                padding: '0.4rem 2.5rem 0.4rem 0.8rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                width: '120px',
                                color: '#2d3748',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                            }}
                        />
                        <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>📅</span>
                        {/* Hidden actual date picker trigger could go here */}
                    </div>

                    <button
                        onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() + 7); setStartDate(d); }}
                        style={navBtnStyle}
                    >›</button>
                    <button
                        onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() + 14); setStartDate(d); }}
                        style={navBtnStyle}
                    >»</button>

                    <button style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#718096', cursor: 'pointer', fontWeight: 600 }}>⟳</button>
                </div>
            </div>

            <div className="table-container" style={{
                background: 'white',

                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                overflowX: 'auto',
                border: '1px solid #e2e8f0',
                borderTop: 'none' // blend with header potentially? or keep distinct
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                    <thead>
                        {/* Month Header Row (Simulated based on image) */}
                        <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                            <th style={{ ...headerStyle, width: '250px', background: 'white', position: 'sticky', left: 0 }}>Units</th>
                            {/* Simplified: just showing blank or month name for the first visible date's month */}
                            <th colSpan={dates.length} style={{ textAlign: 'center', padding: '0.5rem', color: '#718096', fontSize: '0.8rem' }}>
                                {startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </th>
                        </tr>
                        {/* Days Header Row */}
                        <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                            <th style={{ ...headerStyle, width: '250px', position: 'sticky', left: 0, background: 'white', zIndex: 10 }}></th>
                            {dates.map(d => (
                                <th key={d.toString()} style={{ ...headerStyle, textAlign: 'center', minWidth: '60px', padding: '0.5rem' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#2d3748' }}>{d.getDate()}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 400 }}>{d.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {UNIT_GROUPS.map(group => {
                            const total = UNITS.filter(u => u.groupId === group.id).length;
                            return (
                                <tr key={group.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                    <td style={{ ...cellStyle, fontWeight: 500, color: 'var(--color-text-main)', position: 'sticky', left: 0, background: 'white' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: group.color }}></div>
                                                    <span style={{ color: '#2d3748', fontSize: '0.9rem' }}>{group.name}</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#718096', marginLeft: '1rem' }}>{group.id}</div>
                                            </div>
                                            <div style={{ color: '#cbd5e1', fontSize: '1.2rem' }}>⋮</div>
                                        </div>
                                    </td>
                                    {dates.map((d, i) => {
                                        const avail = getAvailability(group.id, d);
                                        const bgColor = getBlockColor(group.id, avail); // Use consistent row color
                                        return (
                                            <td key={i} style={{ padding: '0.25rem', borderRight: '1px solid white', textAlign: 'center' }}>
                                                <div style={{
                                                    backgroundColor: bgColor,
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '2px', // Slight radius
                                                    fontWeight: 500,
                                                    color: '#2d3748',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {avail}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                        {/* Occupancy Row */}
                        <tr style={{ borderTop: '2px solid #e2e8f0' }}>
                            <td style={{ ...cellStyle, padding: '1rem', color: '#4a5568' }}>Occupancy</td>
                            {dates.map((d, i) => {
                                let dayOccupied = 0;
                                let dayTotal = UNITS.length;
                                UNIT_GROUPS.forEach(g => {
                                    dayOccupied += (UNITS.filter(u => u.groupId === g.id).length - getAvailability(g.id, d));
                                });
                                const occ = Math.round((dayOccupied / dayTotal) * 100);
                                return (
                                    <td key={i} style={{ textAlign: 'center', fontSize: '0.8rem', color: '#4a5568', padding: '0.5rem', border: '1px solid #edf2f7' }}>
                                        {occ}%
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
            <style>{`
                .btn-nav:hover {
                    background-color: #f7fafc;
                }
            `}</style>
        </main>
    );
}

const navBtnStyle = {
    background: 'white',
    border: 'none',
    color: '#4a5568',
    fontSize: '1.2rem',
    cursor: 'pointer',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background 0.2s'
};

const headerStyle = {
    textAlign: 'left',
    padding: '0.5rem',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted)',
    fontWeight: 600
};

const cellStyle = {
    padding: '0.75rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem'
};
