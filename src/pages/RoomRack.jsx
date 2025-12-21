import React, { useState, useMemo } from 'react';
import { UNITS, UNIT_GROUPS, MOCK_RESERVATIONS, STATUS_COLORS } from '../data/mockData';

export default function RoomRack() {
    // State for timeline control
    const [startDate, setStartDate] = useState(new Date('2025-12-19')); // Default to match mock data
    const daysToShow = 14;
    const cellWidth = 60; // px per day

    // Generate dates for the header
    const dates = useMemo(() => {
        const result = [];
        for (let i = 0; i < daysToShow; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            result.push(d);
        }
        return result;
    }, [startDate]);

    // Group units by Unit Group for display
    const unitsByGroup = useMemo(() => {
        // Sort groups by rank
        const sortedGroups = [...UNIT_GROUPS].sort((a, b) => a.rank - b.rank);
        return sortedGroups.map(group => ({
            ...group,
            units: UNITS.filter(u => u.groupId === group.id)
        })).filter(g => g.units.length > 0);
    }, []);

    // Helper to position reservations
    const getReservationStyle = (res) => {
        const resStart = new Date(res.arrival);
        const resEnd = new Date(res.departure);

        // Calculate diff in days from timeline start
        const startDiff = (resStart - startDate) / (1000 * 60 * 60 * 24);
        const duration = (resEnd - resStart) / (1000 * 60 * 60 * 24);

        return {
            left: `${startDiff * cellWidth}px`,
            width: `${duration * cellWidth}px`,
            position: 'absolute',
            top: '4px',
            height: '32px',
            backgroundColor: STATUS_COLORS[res.status]?.bg || '#cbd5e1',
            borderRadius: '4px',
            border: `1px solid ${STATUS_COLORS[res.status]?.text || '#64748b'}`,
            color: STATUS_COLORS[res.status]?.text || '#334155',
            fontSize: '0.75rem',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            fontWeight: 600,
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        };
    };

    const handlePrevious = () => {
        const d = new Date(startDate);
        d.setDate(d.getDate() - 7);
        setStartDate(d);
    };

    const handleNext = () => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 7);
        setStartDate(d);
    };

    return (
        <main className="dashboard-view fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Header Toolbar */}
            <header className="view-header" style={{ flexShrink: 0, marginBottom: '1rem' }}>
                <div>
                    <h1>Room Rack</h1>
                    <p className="subtitle">Visual timeline of room occupancy.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn" onClick={handlePrevious} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem' }}>← Prev</button>
                    <span style={{ fontWeight: 600, minWidth: '120px', textAlign: 'center' }}>
                        {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <button className="btn" onClick={handleNext} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem' }}>Next →</button>
                    <button className="btn btn-primary" style={{ marginLeft: '1rem' }}>
                        <span>+ New Booking</span>
                    </button>
                </div>
            </header>

            {/* Rack Content */}
            <div className="rack-container" style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.02)',
                display: 'flex',
                position: 'relative'
            }}>
                {/* Fixed Room Column */}
                <div style={{ width: '200px', flexShrink: 0, borderRight: '1px solid #e2e8f0', zIndex: 30, background: 'white' }}>
                    {/* Header Corner */}
                    <div style={{ height: '50px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        Unit
                    </div>
                    {/* Room Rows - Sidebar */}
                    <div className="custom-scrollbar" style={{ overflowY: 'hidden' }}> {/* Synced scroll handled by layout container usually, simple version here */}
                        {unitsByGroup.map(group => (
                            <div key={group.id}>
                                {/* Group Header */}
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    background: '#f1f5f9',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: 'var(--color-text-secondary)',
                                    borderBottom: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <div style={{ width: '10px', height: '10px', backgroundColor: group.color, borderRadius: '2px' }}></div>
                                    {group.name}
                                </div>
                                {/* Units */}
                                {group.units.map(unit => (
                                    <div key={unit.id} style={{
                                        height: '40px',
                                        borderBottom: '1px solid #f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 1rem',
                                        fontSize: '0.9rem',
                                        fontWeight: 500
                                    }}>
                                        {unit.name}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scrollable Timeline */}
                <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }} className="timeline-scroll-area">
                    <div style={{ minWidth: `${dates.length * cellWidth}px` }}>
                        {/* Dates Header */}
                        <div style={{ height: '50px', display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 20 }}>
                            {dates.map((date, i) => {
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const isToday = date.toDateString() === new Date().toDateString();
                                return (
                                    <div key={i} style={{
                                        width: `${cellWidth}px`,
                                        flexShrink: 0,
                                        borderRight: '1px solid #f1f5f9',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: isToday ? 'var(--color-primary-light)' : (isWeekend ? 'rgba(0,0,0,0.02)' : 'transparent')
                                    }}>
                                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isToday ? 'var(--color-primary)' : 'var(--color-text-main)' }}>{date.getDate()}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Timeline Grid & Content */}
                        <div style={{ position: 'relative' }}>
                            {/* Background Grid Lines */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', pointerEvents: 'none' }}>
                                {dates.map((_, i) => (
                                    <div key={i} style={{ width: `${cellWidth}px`, borderRight: '1px solid #f8fafc', height: '100%' }}></div>
                                ))}
                            </div>

                            {/* Timeline Rows */}
                            {unitsByGroup.map(group => (
                                <div key={group.id}>
                                    {/* Spacing for Group Header in fixed col */}
                                    <div style={{ height: '29px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', opacity: 0.5 }}></div>

                                    {/* Unit Rows with Reservations */}
                                    {group.units.map(unit => (
                                        <div key={unit.id} style={{ height: '40px', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                                            {/* Render Reservations for this unit */}
                                            {MOCK_RESERVATIONS.filter(r => r.room === unit.name).map(res => (
                                                <div key={res.id} style={getReservationStyle(res)} title={`${res.guestName} (${res.status})`}>
                                                    {res.guestName}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
