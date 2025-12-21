import React from 'react';

export default function Dashboard() {
    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="subtitle">Welcome back, here's the overview for today.</p>
                </div>
                <button className="btn btn-primary">
                    <span>+ New Booking</span>
                </button>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Arrivals</h3>
                    <div className="value">12</div>
                    <span className="trend positive">↑ 2 from yesterday</span>
                </div>
                <div className="stat-card">
                    <h3>Departures</h3>
                    <div className="value">8</div>
                    <span className="trend neutral">On track</span>
                </div>
                <div className="stat-card">
                    <h3>Occupancy</h3>
                    <div className="value">76%</div>
                    <span className="trend positive">↑ 5% this week</span>
                </div>
                <div className="stat-card">
                    <h3>RevPAR</h3>
                    <div className="value">$124</div>
                    <span className="trend positive">↑ $12 vs last year</span>
                </div>

                <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                    <h3>Room Status</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{ flex: 1, backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>Clean</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>45</div>
                        </div>
                        <div style={{ flex: 1, backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>Dirty</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>12</div>
                        </div>
                        <div style={{ flex: 1, backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ color: 'var(--color-text-muted)', fontWeight: 'bold' }}>OOO</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>3</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
