import React, { useState } from 'react';
import { UNITS, UNIT_GROUPS, MOCK_RESERVATIONS, HOUSEKEEPING_CONDITIONS } from '../data/mockData';

export default function Housekeeping() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('2025-12-21'); // Simulating "Today"

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

    UNITS.forEach(unit => {
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
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>≡</span> Filter
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                            <th style={{ width: '40px', padding: '1rem' }}><input type="checkbox" /></th>
                            <th style={headerStyle}>Unit</th>
                            <th style={headerStyle}>Unit Group</th>
                            <th style={headerStyle}>Current Condition</th>
                            <th style={headerStyle}>Current Status</th>
                            <th style={headerStyle}>Zone</th>
                            <th style={{ ...headerStyle, width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {UNITS.filter(u => u.name.includes(searchTerm)).map(unit => {
                            const group = UNIT_GROUPS.find(g => g.id === unit.groupId);
                            const style = HOUSEKEEPING_CONDITIONS[unit.condition] || {};
                            const status = getUnitStatus(unit.name);
                            const resStatus = getReservationStatus(unit.name);

                            return (
                                <tr key={unit.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                    <td style={{ padding: '1rem' }}><input type="checkbox" /></td>
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
