import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UNITS, UNIT_GROUPS, STATUS_COLORS } from '../data/mockData';
import { useReservations } from '../context/ReservationContext';

export default function RoomRack() {
    const navigate = useNavigate();
    const { reservations, updateReservation, updateReservationStatus } = useReservations(); // Global State

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

    // Local state for drag interaction
    const [draggedRes, setDraggedRes] = useState(null);

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
            cursor: 'grab',
            zIndex: 10,
            opacity: draggedRes?.id === res.id ? 0.5 : 1,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        };
    };

    // --- Drag & Drop Handlers ---
    const handleDragStart = (e, res) => {
        setDraggedRes(res);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Set custom drag image if needed
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetRoom) => {
        e.preventDefault();
        if (!draggedRes) return;

        // Calculate new date based on X position
        const rowRect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rowRect.left; // X relative to the row start
        const dayIndex = Math.floor(clickX / cellWidth);

        // Calculate new Start Date
        const newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() + dayIndex);

        // Calculate new End Date (preserving duration)
        const oldStart = new Date(draggedRes.arrival);
        const oldEnd = new Date(draggedRes.departure);
        const durationMs = oldEnd.getTime() - oldStart.getTime();
        const newEnd = new Date(newStart.getTime() + durationMs);

        // Format dates as YYYY-MM-DD
        const toYMD = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const updatedRes = {
            ...draggedRes,
            room: targetRoom,
            arrival: toYMD(newStart),
            departure: toYMD(newEnd)
        };

        updateReservation(updatedRes);
        setDraggedRes(null);
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

    // Scroll Sync Refs
    const sidebarRef = React.useRef(null);
    const timelineRef = React.useRef(null);

    const handleScroll = (e) => {
        if (sidebarRef.current && timelineRef.current) {
            const scrollTop = e.target.scrollTop;
            if (e.target === timelineRef.current) {
                sidebarRef.current.scrollTop = scrollTop;
            } else {
                timelineRef.current.scrollTop = scrollTop;
            }
        }
    };

    const handleToday = () => {
        const today = new Date('2025-12-25');
        // Center view on today - 2 days
        const newStart = new Date(today);
        newStart.setDate(today.getDate() - 2);
        setStartDate(newStart);
    };



    // State for Side Panel
    const [selectedRes, setSelectedRes] = useState(null);

    return (
        <main className="dashboard-view fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
            {/* Header Toolbar */}
            <header className="view-header" style={{ flexShrink: 0, marginBottom: '1rem' }}>
                <div>
                    {/* Breadcrumbs */}
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ color: '#718096' }}>Jezebel Hotel Rhein</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        <span style={{ background: '#FED7D7', padding: '2px 4px', borderRadius: '4px', color: 'black' }}>Test</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        Room rack
                    </div>
                    <h1>Room rack</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        className="btn"
                        onClick={handleToday}
                        style={{ background: 'white', border: '1px solid #cbd5e1', color: '#4a5568', marginRight: '0.5rem' }}
                    >
                        Today
                    </button>

                    <div style={{ display: 'flex', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                        <button className="btn" onClick={handlePrevious} style={{ background: 'transparent', border: 'none', borderRight: '1px solid #cbd5e1', padding: '0.5rem 0.8rem', cursor: 'pointer', color: '#4a5568' }}>&lt;</button>
                        <span style={{ fontWeight: 600, minWidth: '100px', textAlign: 'center', padding: '0.5rem', fontSize: '0.9rem', color: '#2d3748', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <button className="btn" onClick={handleNext} style={{ background: 'transparent', border: 'none', borderLeft: '1px solid #cbd5e1', padding: '0.5rem 0.8rem', cursor: 'pointer', color: '#4a5568' }}>&gt;</button>
                    </div>

                    <button className="btn" style={{ background: 'transparent', border: 'none', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <span style={{ fontSize: '1.2rem' }}>≡</span> Filter
                    </button>

                    <button className="btn" onClick={() => navigate('/reservations')} style={{ background: 'transparent', color: '#F6AD55', fontWeight: 600, border: 'none' }}>
                        + New Booking
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
                <div
                    ref={sidebarRef}
                    style={{ width: '200px', flexShrink: 0, borderRight: '1px solid #e2e8f0', zIndex: 30, background: 'white', overflow: 'hidden', height: '100%' }}
                >
                    {/* Header Corner */}
                    <div style={{ height: '50px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        Unit
                    </div>
                    {/* Room Rows - Sidebar */}
                    <div style={{ paddingBottom: '20px' }}> {/* Padding for scrollbar offset */}
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
                                    gap: '0.5rem',
                                    height: '30px' // explicit height matching spacing
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
                <div
                    ref={timelineRef}
                    onScroll={handleScroll}
                    style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', height: '100%' }}
                    className="timeline-scroll-area"
                >
                    <div style={{ minWidth: `${dates.length * cellWidth}px`, paddingBottom: '20px' }}>
                        {/* Dates Header */}
                        <div style={{ height: '50px', display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 20 }}>
                            {dates.map((date, i) => {
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const isToday = date.toDateString() === new Date('2025-12-25').toDateString();
                                return (
                                    <div key={i} style={{
                                        width: `${cellWidth}px`,
                                        flexShrink: 0,
                                        borderRight: '1px solid #f1f5f9',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: isToday ? '#E6FFFA' : (isWeekend ? 'rgba(0,0,0,0.02)' : 'transparent'),
                                        borderBottom: isToday ? '3px solid var(--color-primary)' : 'none'
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
                                {dates.map((date, i) => {
                                    // Today Line
                                    const isToday = date.toDateString() === new Date('2025-12-25').toDateString();
                                    return (
                                        <div key={i} style={{
                                            width: `${cellWidth}px`,
                                            borderRight: '1px solid #f8fafc',
                                            height: '100%',
                                            background: isToday ? 'rgba(56, 178, 172, 0.05)' : 'transparent'
                                        }}></div>
                                    )
                                })}
                            </div>

                            {/* Timeline Rows */}
                            {unitsByGroup.map(group => (
                                <div key={group.id}>
                                    {/* Spacing for Group Header in fixed col MATCHING HEIGHT */}
                                    <div style={{ height: '30px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', opacity: 0.5 }}></div>

                                    {/* Unit Rows with Reservations */}
                                    {group.units.map(unit => (
                                        <div
                                            key={unit.id}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, unit.name)}
                                            style={{ height: '40px', borderBottom: '1px solid #f1f5f9', position: 'relative' }}
                                        >
                                            {/* Render Reservations for this unit using Local State */}
                                            {reservations.filter(r => r.room === unit.name).map(res => (
                                                <div
                                                    key={res.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, res)}
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedRes(res);
                                                    }}
                                                    style={getReservationStyle(res)}
                                                    title={`${res.guestName} (${res.status})`}
                                                >
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

            {/* SIDE PANEL */}
            {selectedRes && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '380px',
                    height: '100%',
                    background: 'white',
                    boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideInRight 0.3s ease-out'
                }}>
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', fontFamily: 'monospace' }}>RES-{selectedRes.id}</div>
                            <h2 style={{ fontSize: '1.5rem', color: '#2d3748', margin: 0 }}>{selectedRes.guestName}</h2>
                            <div style={{ marginTop: '0.5rem' }}>
                                <span style={{
                                    backgroundColor: STATUS_COLORS[selectedRes.status]?.bg,
                                    color: STATUS_COLORS[selectedRes.status]?.text,
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase'
                                }}>
                                    {STATUS_COLORS[selectedRes.status]?.label}
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setSelectedRes(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#a0aec0' }}>×</button>
                    </div>

                    <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#718096', display: 'block', marginBottom: '4px' }}>Stay Dates</label>
                            <div style={{ fontSize: '1rem', color: '#2d3748' }}>
                                {new Date(selectedRes.arrival).toLocaleDateString()} — {new Date(selectedRes.departure).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '2px' }}>
                                {Math.ceil((new Date(selectedRes.departure) - new Date(selectedRes.arrival)) / (1000 * 60 * 60 * 24))} Nights
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#718096', display: 'block', marginBottom: '4px' }}>Unit</label>
                                <div style={{ fontSize: '1rem', color: '#2d3748', fontWeight: 500 }}>{selectedRes.room}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#718096', display: 'block', marginBottom: '4px' }}>Guests</label>
                                <div style={{ fontSize: '1rem', color: '#2d3748' }}>{selectedRes.pax} Adults</div>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '4px', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#4a5568' }}>Total Amount</span>
                                <span style={{ fontWeight: 600, color: '#2d3748' }}>{(selectedRes.rate * selectedRes.pax).toFixed(2)} CHF</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#4a5568' }}>Balance</span>
                                <span style={{ fontWeight: 600, color: '#e53e3e' }}>0.00 CHF</span>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {/* Dynamic Status Actions */}
                                {selectedRes.status === 'confirmed' && (
                                    <button
                                        onClick={() => {
                                            updateReservationStatus(selectedRes.id, 'checked_in');
                                            setSelectedRes({ ...selectedRes, status: 'checked_in' }); // Optimistic UI update
                                        }}
                                        className="btn"
                                        style={{ width: '100%', textAlign: 'left', padding: '0.75rem', border: '1px solid #38B2AC', background: '#E6FFFA', color: '#38B2AC', fontWeight: 600 }}
                                    >
                                        Keys 🔑 Check In
                                    </button>
                                )}

                                {selectedRes.status === 'checked_in' && (
                                    <button
                                        onClick={() => {
                                            updateReservationStatus(selectedRes.id, 'checked_out');
                                            setSelectedRes({ ...selectedRes, status: 'checked_out' });
                                        }}
                                        className="btn"
                                        style={{ width: '100%', textAlign: 'left', padding: '0.75rem', border: '1px solid #718096', background: '#EDF2F7', color: '#2d3748', fontWeight: 600 }}
                                    >
                                        🏁 Check Out
                                    </button>
                                )}

                                <button className="btn" style={{ width: '100%', textAlign: 'left', padding: '0.75rem', border: '1px solid #e2e8f0', background: 'white' }}>
                                    📝 Edit Reservation
                                </button>

                                {selectedRes.status !== 'cancelled' && selectedRes.status !== 'checked_out' && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to cancel this reservation?')) {
                                                updateReservationStatus(selectedRes.id, 'cancelled');
                                                setSelectedRes(null);
                                            }
                                        }}
                                        className="btn"
                                        style={{ width: '100%', textAlign: 'left', padding: '0.75rem', border: '1px solid #e2e8f0', background: 'white', color: '#e53e3e' }}
                                    >
                                        ✖ Cancel Booking
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <button
                                className="btn btn-apaleo-primary"
                                style={{ width: '100%', background: '#F6AD55', color: 'white', border: 'none', padding: '0.8rem', fontWeight: 600, borderRadius: '4px' }}
                                onClick={() => navigate('/reservations')}
                            >
                                Open Full Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </main>
    );
}
