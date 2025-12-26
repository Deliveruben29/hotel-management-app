import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryService } from '../services/inventoryService';
import { useReservations } from '../context/ReservationContext';
import { STATUS_COLORS as MOCK_STATUS_COLORS } from '../data/mockData';

const MAINTENANCE_TYPES = {
    'OOO': { label: 'Out of Order', color: '#000000', bg: '#CBD5E0' }, // Removed from Inventory
    'OOS': { label: 'Out of Service', color: '#DD6B20', bg: '#FEEBC8' } // Just temporary block
};

export default function RoomRack() {
    const navigate = useNavigate();
    const { reservations, addReservation, updateReservation, updateReservationStatus } = useReservations();

    // Data State (Real Data)
    const [units, setUnits] = useState([]);
    const [unitGroups, setUnitGroups] = useState([]);

    // Load Inventory Data
    useEffect(() => {
        const loadInventory = async () => {
            try {
                const [unitsData, groupsData] = await Promise.all([
                    InventoryService.getUnits(),
                    InventoryService.getUnitGroups()
                ]);
                setUnits(unitsData);
                setUnitGroups(groupsData);
            } catch (error) {
                console.error("Failed to load inventory for Room Rack:", error);
            }
        };
        loadInventory();
    }, []);

    // Timeline State
    const [startDate, setStartDate] = useState(new Date(new Date().toISOString().split('T')[0]));
    const daysToShow = 21;
    const cellWidth = 60; // px per day

    // Generate dates
    const dates = useMemo(() => {
        const result = [];
        for (let i = 0; i < daysToShow; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            result.push(d);
        }
        return result;
    }, [startDate]);

    // Group units
    const unitsByGroup = useMemo(() => {
        // Use Mock Groups if DB empty to avoid crash, but DB should be populated now.
        // Sort groups by name or rank (if available)
        const groups = [...unitGroups].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return groups.map(group => ({
            ...group,
            units: units.filter(u => u.groupId === group.id)
        })).filter(g => g.units.length > 0);
    }, [units, unitGroups]);

    // Drag Interaction
    const [draggedRes, setDraggedRes] = useState(null);

    // Maintenance Modal State
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [maintenanceForm, setMaintenanceForm] = useState({
        unitId: '',
        type: 'OOO', // OOO or OOS
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        reason: ''
    });

    // Helper: Reservation Style
    const getReservationStyle = (res) => {
        const resStart = new Date(res.arrival);
        const resEnd = new Date(res.departure);
        const startDiff = (resStart - startDate) / (1000 * 60 * 60 * 24);
        const duration = Math.max((resEnd - resStart) / (1000 * 60 * 60 * 24), 1); // Min 1 day

        let bg = '#cbd5e1';
        let border = '#64748b';
        let color = '#334155';

        if (res.status === 'maintenance') {
            const mType = res.data?.type || 'OOO';
            const style = MAINTENANCE_TYPES[mType] || MAINTENANCE_TYPES['OOO'];
            bg = style.bg;
            border = style.color;
            color = style.color;
        } else {
            const s = MOCK_STATUS_COLORS[res.status];
            if (s) {
                bg = s.bg;
                border = s.text;
                color = s.text;
            }
        }

        return {
            left: `${startDiff * cellWidth}px`,
            width: `${duration * cellWidth}px`,
            position: 'absolute',
            top: '4px',
            height: '32px',
            backgroundColor: bg,
            borderRadius: '4px',
            border: `1px solid ${border}`,
            color: color,
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
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            // Stripe pattern for maintenance
            backgroundImage: res.status === 'maintenance' ?
                `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)` : 'none'
        };
    };

    // --- Handlers ---
    const handleDragStart = (e, res) => {
        setDraggedRes(res);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

    const handleDrop = async (e, targetRoom) => {
        e.preventDefault();
        if (!draggedRes) return;

        const rowRect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rowRect.left;
        const dayIndex = Math.floor(clickX / cellWidth);

        const newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() + dayIndex);

        const oldStart = new Date(draggedRes.arrival);
        const oldEnd = new Date(draggedRes.departure);
        const durationMs = oldEnd.getTime() - oldStart.getTime();
        const newEnd = new Date(newStart.getTime() + durationMs);

        const toYMD = (d) => d.toISOString().split('T')[0];

        const updatedRes = {
            ...draggedRes,
            room: targetRoom,
            arrival: toYMD(newStart),
            departure: toYMD(newEnd)
        };

        // Optimistic update handled by context usually, but we need to await if we want strictness
        await updateReservation(updatedRes);
        setDraggedRes(null);
    };

    const handleMaintenanceSubmit = async (e) => {
        e.preventDefault();
        const targetUnit = units.find(u => u.id === maintenanceForm.unitId);

        const newBlockw = {
            id: `M-${Date.now()}`,
            guestName: 'Maintenance',
            status: 'maintenance', // Special status
            arrival: maintenanceForm.startDate,
            departure: maintenanceForm.endDate,
            room: targetUnit ? targetUnit.name : 'Unknown', // Need name for RoomRack logic
            unit_id: maintenanceForm.unitId,
            type: 'Maintenance',
            pax: 0,
            rate: 0,
            email: 'maintenance@hotel.com',
            phone: '',
            data: {
                type: maintenanceForm.type, // OOO or OOS
                reason: maintenanceForm.reason
            }
        };

        await addReservation(newBlockw);
        setShowMaintenanceModal(false);
        setMaintenanceForm({ ...maintenanceForm, reason: '' }); // Reset reason
    };

    // Navigation
    const handlePrevious = () => { const d = new Date(startDate); d.setDate(d.getDate() - 7); setStartDate(d); };
    const handleNext = () => { const d = new Date(startDate); d.setDate(d.getDate() + 7); setStartDate(d); };
    const handleToday = () => { setStartDate(new Date(new Date().toISOString().split('T')[0])); };

    // Scroll Sync
    const sidebarRef = useRef(null);
    const timelineRef = useRef(null);
    const handleScroll = (e) => {
        if (sidebarRef.current && timelineRef.current) {
            const scrollTop = e.target.scrollTop;
            if (e.target === timelineRef.current) sidebarRef.current.scrollTop = scrollTop;
            else timelineRef.current.scrollTop = scrollTop;
        }
    };

    // Side Panel
    const [selectedRes, setSelectedRes] = useState(null);

    return (
        <main className="dashboard-view fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
            {/* Header */}
            <header className="view-header" style={{ flexShrink: 0, marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ color: '#718096' }}>Jezebel Hotel Rhein</span> / Room rack
                    </div>
                    <h1>Room rack</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn" onClick={handleToday} style={{ background: 'white', border: '1px solid #cbd5e1' }}>Today</button>
                    <div style={{ display: 'flex', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                        <button className="btn" onClick={handlePrevious} style={{ border: 'none', borderRight: '1px solid #cbd5e1' }}>&lt;</button>
                        <span style={{ padding: '0.5rem', minWidth: '100px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        <button className="btn" onClick={handleNext} style={{ border: 'none', borderLeft: '1px solid #cbd5e1' }}>&gt;</button>
                    </div>
                    <button className="btn" onClick={() => setShowMaintenanceModal(true)} style={{ background: '#2d3748', color: 'white' }}>
                        🛠 Maintenance
                    </button>
                    <button className="btn" onClick={() => navigate('/reservations')} style={{ background: '#F6AD55', color: 'white' }}>
                        + New Booking
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="rack-container" style={{ flex: 1, background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', border: '1px solid rgba(0,0,0,0.02)' }}>
                {/* Fixed Sidebar */}
                <div ref={sidebarRef} style={{ width: '200px', flexShrink: 0, borderRight: '1px solid #e2e8f0', background: 'white', overflow: 'hidden', height: '100%' }}>
                    <div style={{ height: '50px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Unit</div>
                    <div style={{ paddingBottom: '20px' }}>
                        {unitsByGroup.map(group => (
                            <div key={group.id}>
                                <div style={{ padding: '0.5rem 1rem', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', height: '30px' }}>
                                    <div style={{ width: '10px', height: '10px', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div>
                                    {group.name}
                                </div>
                                {group.units.map(unit => (
                                    <div key={unit.id} style={{ height: '40px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.9rem', fontWeight: 500 }}>{unit.name}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div ref={timelineRef} onScroll={handleScroll} style={{ flex: 1, overflow: 'auto', height: '100%' }}>
                    <div style={{ minWidth: `${dates.length * cellWidth}px`, paddingBottom: '20px' }}>
                        {/* Dates Header */}
                        <div style={{ height: '50px', display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 20 }}>
                            {dates.map((date, i) => {
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const isToday = date.toDateString() === new Date().toDateString();
                                return (
                                    <div key={i} style={{ width: `${cellWidth}px`, flexShrink: 0, borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isToday ? '#E6FFFA' : (isWeekend ? 'rgba(0,0,0,0.02)' : 'transparent'), borderBottom: isToday ? '3px solid var(--color-primary)' : 'none' }}>
                                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isToday ? 'var(--color-primary)' : 'var(--color-text-main)' }}>{date.getDate()}</span>
                                    </div>
                                )
                            })}
                        </div>
                        {/* Grid */}
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', pointerEvents: 'none' }}>
                                {dates.map((date, i) => (
                                    <div key={i} style={{ width: `${cellWidth}px`, borderRight: '1px solid #f8fafc', height: '100%' }}></div>
                                ))}
                            </div>
                            {unitsByGroup.map(group => (
                                <div key={group.id}>
                                    <div style={{ height: '30px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', opacity: 0.5 }}></div>
                                    {group.units.map(unit => (
                                        <div key={unit.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, unit.name)} style={{ height: '40px', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                                            {reservations.filter(r => r.room === unit.name).map(res => (
                                                <div key={res.id} draggable onDragStart={(e) => handleDragStart(e, res)} onDoubleClick={(e) => { e.stopPropagation(); setSelectedRes(res); }} style={getReservationStyle(res)} title={res.guestName}>
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

            {/* Side Panel (Simplified) */}
            {selectedRes && (
                <div style={{ position: 'absolute', top: 0, right: 0, width: '380px', height: '100%', background: 'white', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', zIndex: 50, padding: '1.5rem', animation: 'slideInRight 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2>{selectedRes.guestName}</h2>
                        <button onClick={() => setSelectedRes(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                    </div>
                    {/* Content depends on if it's maintenance or reservation */}
                    {selectedRes.status === 'maintenance' ? (
                        <div>
                            <div style={{ background: '#FFF5F5', color: '#C53030', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 600 }}>
                                {selectedRes.data?.type === 'OOO' ? 'Out of Order' : 'Out of Service'}
                            </div>
                            <p><strong>Reason:</strong> {selectedRes.data?.reason}</p>
                            <p><strong>Date:</strong> {selectedRes.arrival} to {selectedRes.departure}</p>
                            <button className="btn" style={{ width: '100%', background: '#FC8181', color: 'white', marginTop: '1rem' }} onClick={() => { if (window.confirm('Remove block?')) { updateReservationStatus(selectedRes.id, 'cancelled'); setSelectedRes(null); } }}>Remove Block</button>
                        </div>
                    ) : (
                        <div>
                            {/* Standard Reservation details ... */}
                            <p>Guest reservation details here...</p>
                            <button className="btn" style={{ width: '100%', marginTop: 'auto', background: '#F6AD55', color: 'white' }} onClick={() => navigate('/reservations')}>View Full Details</button>
                        </div>
                    )}
                </div>
            )}

            {/* Maintenance Modal */}
            {showMaintenanceModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create Maintenance Block</h2>
                        <form onSubmit={handleMaintenanceSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Unit</label>
                                <select required style={{ width: '100%', padding: '0.5rem' }} value={maintenanceForm.unitId} onChange={e => setMaintenanceForm({ ...maintenanceForm, unitId: e.target.value })}>
                                    <option value="">Select Unit...</option>
                                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Type</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label><input type="radio" name="type" value="OOO" checked={maintenanceForm.type === 'OOO'} onChange={e => setMaintenanceForm({ ...maintenanceForm, type: e.target.value })} /> Out of Order</label>
                                    <label><input type="radio" name="type" value="OOS" checked={maintenanceForm.type === 'OOS'} onChange={e => setMaintenanceForm({ ...maintenanceForm, type: e.target.value })} /> Out of Service</label>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem' }}>From</label>
                                    <input type="date" required value={maintenanceForm.startDate} onChange={e => setMaintenanceForm({ ...maintenanceForm, startDate: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem' }}>To</label>
                                    <input type="date" required value={maintenanceForm.endDate} onChange={e => setMaintenanceForm({ ...maintenanceForm, endDate: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Reason</label>
                                <textarea required value={maintenanceForm.reason} onChange={e => setMaintenanceForm({ ...maintenanceForm, reason: e.target.value })} style={{ width: '100%', padding: '0.5rem', minHeight: '80px' }} placeholder="Why is this maintenance required?"></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn" onClick={() => setShowMaintenanceModal(false)} style={{ background: '#edf2f7', color: '#4a5568' }}>Cancel</button>
                                <button type="submit" className="btn" style={{ background: '#2d3748', color: 'white' }}>Create Block</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}</style>
        </main>
    );
}
