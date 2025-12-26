import React, { useState, useEffect } from 'react';
import { HOUSEKEEPING_CONDITIONS } from '../data/mockData';
import { InventoryService } from '../services/inventoryService';
import { useReservations } from '../context/ReservationContext';

export default function Housekeeping() {
    // Data States
    const [units, setUnits] = useState([]);
    const [unitGroups, setUnitGroups] = useState([]); // Load groups from DB
    const { reservations } = useReservations(); // Use real reservations from context

    // UI State
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [menuOpenId, setMenuOpenId] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [showFilters, setShowFilters] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterCondition, setFilterCondition] = useState('all');
    const [filterFloor, setFilterFloor] = useState('all');
    const [filterOccupancy, setFilterOccupancy] = useState('all');

    // Load Data from DB
    useEffect(() => {
        const loadData = async () => {
            try {
                const [unitsData, groupsData] = await Promise.all([
                    InventoryService.getUnits(),
                    InventoryService.getUnitGroups()
                ]);
                setUnits(unitsData);
                setUnitGroups(groupsData);
            } catch (error) {
                console.error("Failed to load inventory data:", error);
            }
        };
        loadData();
    }, []);

    // Derived Data for Filter Options
    const floors = [...new Set(units.map(u => u.name.charAt(0)))].sort();

    // Helper to determine occupancy status
    const getUnitStatus = (unitName) => {
        if (!reservations) return 'Free';
        const todayRes = reservations.find(res =>
            res.room === unitName &&
            new Date(res.arrival) <= new Date(filterDate) &&
            new Date(res.departure) > new Date(filterDate)
        );

        if (todayRes) return 'Occupied';
        return 'Free';
    };

    const getReservationStatus = (unitName) => {
        if (!reservations) return null;
        const arrival = reservations.find(res => res.room === unitName && res.arrival === filterDate);
        const departure = reservations.find(res => res.room === unitName && res.departure === filterDate);

        if (arrival) return 'Arriving';
        if (departure) return 'Departing';
        const stay = reservations.find(res =>
            res.room === unitName &&
            new Date(res.arrival) < new Date(filterDate) &&
            new Date(res.departure) > new Date(filterDate)
        );
        if (stay) return 'Stay-through';
        return null;
    };

    // Calculate stats
    const stats = {
        reservations: { departing: 0, arriving: 0, stayThrough: 0 },
        occupied: { dirty: 0, inspect: 0, clean: 0 },
        free: { dirty: 0, inspect: 0, clean: 0 },
        maintenance: { oos: 0, ooo: 0, none: 0 }
    };

    units.forEach(unit => {
        const status = getUnitStatus(unit.name);
        const resStatus = getReservationStatus(unit.name);

        // Res stats
        if (resStatus === 'Arriving') stats.reservations.arriving++;
        if (resStatus === 'Departing') stats.reservations.departing++;
        if (resStatus === 'Stay-through') stats.reservations.stayThrough++;

        // Housekeeping stats
        const condition = unit.condition?.toLowerCase() || 'clean';
        const key = condition.toLowerCase();

        if (status === 'Occupied') {
            if (stats.occupied[key] !== undefined) stats.occupied[key]++;
        } else {
            if (stats.free[key] !== undefined) stats.free[key]++;
        }
    });

    // Filtering Logic
    const filteredUnits = units.filter(unit => {
        const matchesSearch = unit.name.includes(searchTerm);
        const matchesCategory = filterCategory === 'all' || unit.groupId === filterCategory;
        const matchesCondition = filterCondition === 'all' || unit.condition === filterCondition;
        const matchesFloor = filterFloor === 'all' || unit.name.startsWith(filterFloor);

        const status = getUnitStatus(unit.name);
        const matchesOccupancy = filterOccupancy === 'all' || status === filterOccupancy;

        return matchesSearch && matchesCategory && matchesCondition && matchesFloor && matchesOccupancy;
    });

    // Handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUnits(filteredUnits.map(u => u.id));
        } else {
            setSelectedUnits([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedUnits.includes(id)) {
            setSelectedUnits(selectedUnits.filter(uid => uid !== id));
        } else {
            setSelectedUnits([...selectedUnits, id]);
        }
    };

    const handleBulkClean = async () => {
        // Optimistic update
        const newUnits = units.map(u =>
            selectedUnits.includes(u.id) ? { ...u, condition: 'Clean' } : u
        );
        setUnits(newUnits);

        // Persist
        for (const id of selectedUnits) {
            await InventoryService.updateUnit(id, { condition: 'Clean' });
        }
        setSelectedUnits([]);
    };

    // Date Logic
    const today = new Date().toISOString().split('T')[0];

    const handleDateChange = (val) => {
        if (val < today) return;
        setFilterDate(val);
    };

    const handlePrevDay = () => {
        const d = new Date(filterDate);
        d.setDate(d.getDate() - 1);
        const iso = d.toISOString().split('T')[0];
        if (iso >= today) setFilterDate(iso);
    };

    const handleNextDay = () => {
        const d = new Date(filterDate);
        d.setDate(d.getDate() + 1);
        setFilterDate(d.toISOString().split('T')[0]);
    };

    const handleStatusChange = async (id, newStatus) => {
        // Optimistic update
        setUnits(units.map(u => u.id === id ? { ...u, condition: newStatus } : u));
        setMenuOpenId(null);
        // Persist
        await InventoryService.updateUnit(id, { condition: newStatus });
    };

    const StatusMenuItem = ({ label, onClick, color }) => (
        <div
            onClick={onClick}
            style={{
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
        >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
            {label}
        </div>
    );

    const StatCard = ({ title, metrics }) => (
        <div style={{
            background: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid rgba(0,0,0,0.02)',
            flex: 1,
            minWidth: '240px'
        }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', fontWeight: 500 }}>{title}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {metrics.map((m, i) => (
                    <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{m.value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{m.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <main className="dashboard-view fade-in" onClick={() => setMenuOpenId(null)}>
            {/* Close menu when clicking backdrop */}
            <header className="view-header">
                <div>
                    <h1>Housekeeping</h1>
                    <p className="subtitle">Manage room cleaning and maintenance status.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        className="btn"
                        onClick={handlePrevDay}
                        disabled={filterDate <= today}
                        style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            color: filterDate <= today ? '#cbd5e0' : 'var(--color-text-secondary)',
                            cursor: filterDate <= today ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {"<"}
                    </button>
                    <input
                        type="date"
                        min={today}
                        value={filterDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        style={{
                            border: '1px solid #e2e8f0',
                            padding: '0.6rem',
                            borderRadius: 'var(--radius-md)',
                            fontFamily: 'inherit',
                            color: 'var(--color-text-main)'
                        }}
                    />
                    <button className="btn" onClick={handleNextDay} style={{ background: 'white', border: '1px solid #e2e8f0', color: 'var(--color-text-secondary)' }}>{">"}</button>
                </div>
            </header>

            {/* Toolbar */}
            <div style={{
                marginBottom: '1.5rem',
                background: 'white',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                background: showFilters ? '#edf2f7' : 'none',
                                border: 'none',
                                color: 'var(--color-text-main)',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>≡</span> Filter
                        </button>
                        <input
                            type="text"
                            placeholder="Search unit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: 'var(--radius-sm)',
                                width: '300px'
                            }}
                        />
                    </div>

                    {/* Bulk Actions */}
                    {selectedUnits.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', animation: 'fadeIn 0.2s' }}>
                            <span style={{ fontSize: '0.9rem', color: '#718096', marginRight: '0.5rem', fontWeight: 500 }}>
                                {selectedUnits.length} selected
                            </span>
                            <button
                                className="btn"
                                onClick={handleBulkClean}
                                style={{
                                    background: '#C6F6D5',
                                    border: '1px solid #9AE6B4',
                                    color: '#22543d',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                ✓ Set Clean
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div style={{
                        paddingTop: '1rem',
                        borderTop: '1px solid #e2e8f0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        animation: 'fadeIn 0.2s ease-in'
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#718096' }}>CATEGORY</label>
                            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                <option value="all">All Categories</option>
                                {unitGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#718096' }}>CONDITION</label>
                            <select value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                <option value="all">All Conditions</option>
                                {[...Object.keys(HOUSEKEEPING_CONDITIONS)].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        {/* More filters can be added here */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#718096' }}>FLOOR</label>
                            <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                <option value="all">All Floors</option>
                                {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#718096' }}>OCCUPANCY</label>
                            <select value={filterOccupancy} onChange={(e) => setFilterOccupancy(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                <option value="all">All Statuses</option>
                                <option value="Occupied">Occupied</option>
                                <option value="Free">Free</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Grid - using calculated stats map */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <StatCard title="Reservations with assigned units" metrics={[
                    { label: 'Departing', value: stats.reservations.departing },
                    { label: 'Arriving', value: stats.reservations.arriving },
                    { label: 'Stay-through', value: stats.reservations.stayThrough },
                ]} />
                <StatCard title="Occupied units" metrics={[
                    { label: 'Dirty', value: stats.occupied.dirty },
                    { label: 'Inspect', value: stats.occupied.inspect },
                    { label: 'Clean', value: stats.occupied.clean },
                ]} />
                <StatCard title="Free units" metrics={[
                    { label: 'Dirty', value: stats.free.dirty },
                    { label: 'Inspect', value: stats.free.inspect },
                    { label: 'Clean', value: stats.free.clean },
                ]} />
            </div>

            {/* Units Table */}
            <div className="table-container" style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'visible', // Visible for dropdown!
                border: '1px solid rgba(0,0,0,0.02)',
                paddingBottom: '2rem' // Space for dropdown at bottom
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(247, 250, 252, 0.5)', borderBottom: '1px solid #edf2f7' }}>
                            <th style={{ width: '40px', padding: '1rem' }}>
                                <input
                                    type="checkbox"
                                    checked={filteredUnits.length > 0 && selectedUnits.length === filteredUnits.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th style={headerStyle}>Unit</th>
                            <th style={headerStyle}>Unit Group</th>
                            <th style={headerStyle}>Current Condition</th>
                            <th style={headerStyle}>Current Status</th>
                            <th style={headerStyle}>Zone</th>
                            <th style={{ ...headerStyle, width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUnits.map(unit => {
                            const group = unitGroups.find(g => g.id === unit.groupId);
                            const style = HOUSEKEEPING_CONDITIONS[unit.condition] || {};
                            const status = getUnitStatus(unit.name);
                            const resStatus = getReservationStatus(unit.name);
                            const isMenuOpen = menuOpenId === unit.id;

                            return (
                                <tr key={unit.id} style={{ borderBottom: '1px solid #edf2f7', background: selectedUnits.includes(unit.id) ? '#F0FFF4' : 'transparent' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUnits.includes(unit.id)}
                                            onChange={() => handleSelectOne(unit.id)}
                                        />
                                    </td>
                                    <td style={{ ...cellStyle, fontWeight: 500, color: 'var(--color-text-main)' }}>{unit.name}</td>
                                    <td style={cellStyle}>{group?.name}</td>
                                    <td style={cellStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                width: '10px', height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: style.color || 'gray'
                                            }}></span>
                                            {unit.condition}
                                        </div>
                                    </td>
                                    <td style={cellStyle}>
                                        {status}
                                        {resStatus && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: '#edf2f7', padding: '2px 6px', borderRadius: '4px', color: '#718096' }}>{resStatus}</span>}
                                    </td>
                                    <td style={cellStyle}>-</td>

                                    {/* Action Menu Column */}
                                    <td style={{ ...cellStyle, position: 'relative' }} onClick={e => e.stopPropagation()}>
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpenId(isMenuOpen ? null : unit.id);
                                            }}
                                            style={{
                                                cursor: 'pointer',
                                                fontSize: '1.2rem',
                                                color: '#718096',
                                                width: '30px',
                                                height: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '4px',
                                                background: isMenuOpen ? '#edf2f7' : 'transparent'
                                            }}
                                        >
                                            ⋮
                                        </div>

                                        {isMenuOpen && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '1rem',
                                                top: '3rem',
                                                background: 'white',
                                                borderRadius: '6px',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)',
                                                border: '1px solid #e2e8f0',
                                                zIndex: 50,
                                                minWidth: '150px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#a0aec0', fontWeight: 600, borderBottom: '1px solid #edf2f7' }}>
                                                    SET CONDITION
                                                </div>
                                                <StatusMenuItem label="Reset to Clean" onClick={() => handleStatusChange(unit.id, 'Clean')} color="var(--color-success)" />
                                                <StatusMenuItem label="Set Dirty" onClick={() => handleStatusChange(unit.id, 'Dirty')} color="var(--color-warning)" />
                                                <StatusMenuItem label="Mark as Inspect" onClick={() => handleStatusChange(unit.id, 'Inspect')} color="var(--color-primary)" />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </main>
    );
}

const headerStyle = {
    textAlign: 'left',
    padding: '1rem 1.5rem',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted)',
    fontWeight: 600
};

const cellStyle = {
    padding: '1rem 1.5rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem'
};
