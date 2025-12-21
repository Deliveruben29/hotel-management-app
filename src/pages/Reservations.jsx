import React, { useState } from 'react';
import { MOCK_RESERVATIONS, STATUS_COLORS } from '../data/mockData';

export default function Reservations() {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredReservations = MOCK_RESERVATIONS.filter(res => {
        const matchesStatus = filter === 'all' || res.status === filter;
        const matchesSearch = res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.room.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <h1>Reservations</h1>
                    <p className="subtitle">Manage bookings, arrivals, and departures.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }}>Export</button>
                    <button className="btn btn-primary">
                        <span>+ New Booking</span>
                    </button>
                </div>
            </header>

            {/* Filters & Toolbar */}
            <div style={{
                marginBottom: '1.5rem',
                background: 'white',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: filter === status ? 'var(--color-primary-light)' : 'transparent',
                                color: filter === status ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                fontWeight: 500,
                                textTransform: 'capitalize'
                            }}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search guest, ID, or room..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.6rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: 'var(--radius-sm)',
                            minWidth: '250px',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
            </div>

            {/* Data Grid */}
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.02)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ background: 'rgba(247, 250, 252, 0.5)', borderBottom: '1px solid #edf2f7' }}>
                            <th style={headerStyle}>ID</th>
                            <th style={headerStyle}>Status</th>
                            <th style={headerStyle}>Guest Name</th>
                            <th style={headerStyle}>Room</th>
                            <th style={headerStyle}>Arrival</th>
                            <th style={headerStyle}>Departure</th>
                            <th style={headerStyle}>Source</th>
                            <th style={{ ...headerStyle, textAlign: 'right' }}>Amount</th>
                            <th style={headerStyle}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservations.map((res) => {
                            const statusStyle = STATUS_COLORS[res.status] || { bg: '#eee', text: '#555' };
                            return (
                                <tr key={res.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.1s' }} className="table-row-hover">
                                    <td style={cellStyle}>
                                        <span style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                            #{res.id.split('-')[1]}
                                        </span>
                                    </td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            backgroundColor: statusStyle.bg,
                                            color: statusStyle.text,
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.025em'
                                        }}>
                                            {statusStyle.label}
                                        </span>
                                    </td>
                                    <td style={{ ...cellStyle, fontWeight: 500, color: 'var(--color-text-main)' }}>
                                        {res.guestName}
                                        {res.pax > 1 && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>+{res.pax - 1}</span>}
                                    </td>
                                    <td style={cellStyle}>{res.room}</td>
                                    <td style={cellStyle}>{new Date(res.arrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                    <td style={cellStyle}>{new Date(res.departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                    <td style={cellStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{res.source}</span>
                                        </div>
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600 }}>
                                        ${res.rate}
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                                        <button style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--color-text-muted)', fontSize: '1.2rem', padding: '0 0.5rem'
                                        }}>⋮</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <style>{`
                .table-row-hover:hover {
                    background-color: var(--color-surface-hover);
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
    color: 'var(--color-text-secondary)'
};
