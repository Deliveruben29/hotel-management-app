import React from 'react';

export default function TopHeader() {
    return (
        <header className="top-header">
            <div className="search-bar">
                <input type="text" placeholder="Search reservations, guests..." />
            </div>
            <div className="user-profile" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', cursor: 'pointer', color: '#4a5568' }}>
                    <span style={{ fontSize: '1.25rem' }}>?</span>
                </div>
                <div style={{ position: 'relative', cursor: 'pointer', color: '#4a5568' }}>
                    <span style={{ fontSize: '1.25rem' }}>🛍</span>
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-8px',
                        background: '#e53e3e',
                        color: 'white',
                        fontSize: '0.7rem',
                        padding: '0 4px',
                        borderRadius: '10px',
                        fontWeight: 600
                    }}>5</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#4a5568' }}>
                    <div className="avatar" style={{ background: 'transparent', border: '2px solid #cbd5e1', color: '#4a5568' }}>👤</div>
                </div>
            </div>
        </header>
    );
}
