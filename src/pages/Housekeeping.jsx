import React, { useState } from 'react';
import { UNITS, UNIT_GROUPS, MOCK_RESERVATIONS, HOUSEKEEPING_CONDITIONS } from '../data/mockData';

export default function Housekeeping() {
    // Data States
    const [units, setUnits] = useState(UNITS);
    const [selectedUnits, setSelectedUnits] = useState([]);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('2025-12-21'); // Simulating "Today"
    const [showFilters, setShowFilters] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterCondition, setFilterCondition] = useState('all');
    const [filterFloor, setFilterFloor] = useState('all');
    const [filterOccupancy, setFilterOccupancy] = useState('all');

    // Derived Data for Filter Options
    const floors = [...new Set(units.map(u => u.name.charAt(0)))].sort();

    // Helper to determine occupancy status
    // In a real app, this would be complex date range logic. 
    // Simplified here: Check if any reservation includes "today".
    const getUnitStatus = (unitName) => {
        const todayRes = MOCK_RESERVATIONS.find(res =>
            res.room === unitName &&
            new Date(res.arrival) <= new Date(filterDate) &&
            new Date(res.departure) > new Date(filterDate)
        );

        if (todayRes) return 'Occupied';
        return 'Free';
    };

    const getReservationStatus = (unitName) => {
        const arrival = MOCK_RESERVATIONS.find(res => res.room === unitName && res.arrival === filterDate);
        const departure = MOCK_RESERVATIONS.find(res => res.room === unitName && res.departure === filterDate);

        if (arrival) return 'Arriving';
        if (departure) return 'Departing';
        const stay = MOCK_RESERVATIONS.find(res =>
            res.room === unitName &&
            new Date(res.arrival) < new Date(filterDate) &&
            new Date(res.departure) > new Date(filterDate)
        );
        if (stay) return 'Stay-through';
        return null;
    };

    // calculate stats
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
        if (status === 'Occupied') {
            if (stats.occupied[condition] !== undefined) stats.occupied[condition]++;
        } else {
            if (stats.free[condition] !== undefined) stats.free[condition]++;
        }
    });

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
            <h3 style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '1rem',
                fontWeight: 500
            }}>{title}</h3>
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

    // Bulk Selection Logic
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

    const handleBulkClean = () => {
        const updatedUnits = units.map(u => {
            if (selectedUnits.includes(u.id)) {
                return { ...u, condition: 'Clean' };
            }
            return u;
        });
        setUnits(updatedUnits);
        setSelectedUnits([]);
    };

    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <h1>Housekeeping</h1>
                    <p className="subtitle">Manage room cleaning and maintenance status.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: 'var(--color-text-secondary)' }}>{"<"}</button>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={{
                            border: '1px solid #e2e8f0',
                            padding: '0.6rem',
                            borderRadius: 'var(--radius-md)',
                            fontFamily: 'inherit',
                            color: 'var(--color-text-main)'
                        }}
                    />
                    <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: 'var(--color-text-secondary)' }}>{">"}</button>
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
            }}>
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
                        <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            Export
                        </button>
                        <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 0.5rem' }}></div>
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

                {/* Collapsible Filter Panel */}
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
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            >
                                <option value="all">All Categories</option>
                                {UNIT_GROUPS.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#718096' }}>CONDITION</label>
                            <select
                                value={filterCondition}
                                onChange={(e) => setFilterCondition(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            >
                                <option value="all">All Conditions</option>
                                {[...Object.keys(HOUSEKEEPING_CONDITIONS)].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#718096' }}>FLOOR</label>
                            <select
                                value={filterFloor}
                                onChange={(e) => setFilterFloor(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            >
                                <option value="all">All Floors</option>
                                {floors.map(f => (
                                    <option key={f} value={f}>Floor {f}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#718096' }}>OCCUPANCY</label>
                            <select
                                value={filterOccupancy}
                                onChange={(e) => setFilterOccupancy(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="Occupied">Occupied</option>
                                <option value="Free">Free</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
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
                <StatCard title="Maintenances" metrics={[
                    { label: 'Out of service', value: 0 },
                    { label: 'Out of order', value: 0 },
                    { label: 'None', value: 0 },
                ]} />
            </div>

            {/* Units Table */}
            <div className="table-container" style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.02)'
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
                            const group = UNIT_GROUPS.find(g => g.id === unit.groupId);
                            const style = HOUSEKEEPING_CONDITIONS[unit.condition] || {};
                            const status = getUnitStatus(unit.name);
                            const resStatus = getReservationStatus(unit.name);

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
                                        {resStatus && <span style={{
                                            marginLeft: '0.5rem',
                                            fontSize: '0.75rem',
                                            background: '#edf2f7',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            color: '#718096'
                                        }}>{resStatus}</span>}
                                    </td>
                                    <td style={cellStyle}>-</td>
                                    <td style={cellStyle}>⋮</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

            </div>

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
