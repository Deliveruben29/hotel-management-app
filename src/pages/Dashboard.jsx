import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_RESERVATIONS, UNITS } from '../data/mockData';

// Reusable card component to match the card-grid style
const DashboardCard = ({ title, icon, children, actionLabel, onAction, fullHeight }) => (
    <div style={{
        background: 'white',
        borderRadius: '4px', // Slightly sharper corners like the reference
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: fullHeight ? '100%' : '320px', // Uniform height
        border: '1px solid #e2e8f0'
    }}>
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem', color: '#718096' }}>{icon}</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d3748', margin: 0 }}>{title}</h3>
            </div>
            <div style={{ color: '#4a5568', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {children}
            </div>
        </div>

        {actionLabel && (
            <button className="btn-apaleo" onClick={onAction}>
                {actionLabel}
            </button>
        )}
    </div>
);

export default function Dashboard() {
    const navigate = useNavigate();

    // Calculate Stats from Mock Data
    const stats = useMemo(() => {
        const today = '2025-12-25'; // Fixed date matching user context

        const arrivals = MOCK_RESERVATIONS.filter(r => r.arrival === today);
        const departures = MOCK_RESERVATIONS.filter(r => r.departure === today);
        const inHouse = MOCK_RESERVATIONS.filter(r => r.status === 'checked_in');

        // Simple guest count logic
        const guestsInHouse = inHouse.reduce((acc, curr) => acc + curr.pax, 0);
        const guestsArriving = arrivals.reduce((acc, curr) => acc + curr.pax, 0);
        const guestsDeparting = departures.reduce((acc, curr) => acc + curr.pax, 0);

        return {
            arrivals: {
                total: arrivals.length,
                waiting: arrivals.filter(r => r.status === 'confirmed').length,
                checkedIn: arrivals.filter(r => r.status === 'checked_in').length
            },
            departures: {
                total: departures.length,
                waiting: departures.filter(r => r.status === 'checked_in').length,
                checkedOut: departures.filter(r => r.status === 'checked_out').length
            },
            guests: {
                inHouse: guestsInHouse,
                arrival: guestsArriving,
                departure: guestsDeparting
            }
        };
    }, []);

    return (
        <main className="dashboard-grid fade-in">
            <header className="view-header" style={{ marginBottom: '1.5rem', paddingBottom: 0 }}>
                <div>
                    {/* Breadcrumbs simulation */}
                    <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ color: '#718096' }}>Jezebel Hotel Rhein</span> <span style={{ background: '#FED7D7', padding: '2px 4px', borderRadius: '4px' }}>Test</span>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 400, color: '#2d3748' }}>Dashboard</h1>
                </div>
            </header>

            <div className="apaleo-grid">
                {/* 1. GM Report */}
                <DashboardCard
                    title="General manager report"
                    icon="📊"
                    actionLabel="Check GM report"
                    onAction={() => navigate('/reports/gm')}
                >
                    <p style={{ marginBottom: '1rem' }}>Analyse key performance indicators for your property such as occupancy and RevPAR.</p>
                    <p>Filter the results to show only data for a certain part of your business.</p>
                </DashboardCard>

                {/* 2. Revenues Reports */}
                <DashboardCard
                    title="Revenues reports"
                    icon="📈"
                    actionLabel="View revenues"
                    onAction={() => navigate('/reports/revenues')}
                >
                    <p style={{ marginBottom: '1rem' }}>Get an overview of your hotel's revenues.</p>
                    <p>See gross and net revenues for any time period, broken down by type and VAT.</p>
                </DashboardCard>

                {/* 3. Cashier Report */}
                <DashboardCard title="Cashier report" icon="🧾" actionLabel="Export PDF">
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <InputGroup label="Cashier name*" defaultValue="Jezebel Fuentes" />
                        <InputGroup label="Cash counted" defaultValue="CHF" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <InputGroup label="From*" defaultValue="25/12/2025" icon="📅" />
                        <InputGroup label="Time*" defaultValue="00:00" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.5rem' }}>
                        <InputGroup label="To*" defaultValue="25/12/2025" icon="📅" />
                        <InputGroup label="Time*" defaultValue="23:59" />
                    </div>
                </DashboardCard>

                {/* 4. Company VAT Report */}
                <DashboardCard title="Company VAT report" icon="💼" actionLabel="Export CSV">
                    <p style={{ marginBottom: '1rem' }}>All invoices created for companies, with:</p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>✓ Company code and name</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>✓ Total gross amount</li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✓ VAT breakdown</li>
                    </ul>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ fontSize: '0.7rem', color: '#718096', display: 'block', marginBottom: '2px' }}>Month*</label>
                            <select style={inputStyle}><option>December</option></select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.7rem', color: '#718096', display: 'block', marginBottom: '2px' }}>Year*</label>
                            <input type="number" defaultValue="2025" style={inputStyle} />
                        </div>
                    </div>
                </DashboardCard>

                {/* 5. Ordered Services */}
                <DashboardCard
                    title="Ordered services"
                    icon="🍽️"
                    actionLabel="View ordered services"
                    onAction={() => navigate('/services')}
                >
                    <p>View or export your breakfast list, and lists of all other items and services your quests ordered.</p>
                </DashboardCard>

                {/* 6. Reservations */}
                <DashboardCard
                    title="Reservations"
                    icon="📕"
                    actionLabel="View reservations"
                    onAction={() => navigate('/reservations')}
                >
                    <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>
                        All time-slices and unit types. Today: 25/12/2025.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <StatBlock
                            label="Arrivals"
                            counts={[
                                { l: 'Waiting', v: stats.arrivals.waiting },
                                { l: 'Checked-In', v: stats.arrivals.checkedIn },
                                { l: 'Total', v: stats.arrivals.total }
                            ]}
                        />
                    </div>
                    <div style={{ width: '100%', height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <StatBlock
                            label="Departures"
                            counts={[
                                { l: 'Waiting', v: stats.departures.waiting },
                                { l: 'Checked-Out', v: stats.departures.checkedOut },
                                { l: 'Total', v: stats.departures.total }
                            ]}
                        />
                    </div>
                </DashboardCard>

                {/* 7. Guest Count */}
                <DashboardCard title="Guest count" icon="👥" actionLabel="Export guest count">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                        <span>&lt;</span> 25/12/2025 <span>&gt;</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '1rem' }}>Over night time slice and bedroom only.</p>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem' }}>Guests</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                            <MiniStat v={stats.guests.inHouse} l="In-house" />
                            <MiniStat v={stats.guests.inHouse} l="Stay-over" /> {/* Simplified for demo */}
                            <MiniStat v={stats.guests.arrival} l="Arrivals" />
                            <MiniStat v={stats.guests.departure} l="Departures" />
                        </div>
                    </div>
                </DashboardCard>

                {/* 8. Room Rack */}
                <DashboardCard
                    title="Room rack"
                    icon="📅"
                    actionLabel="View room rack"
                    onAction={() => navigate('/rack')}
                >
                    <p style={{ marginBottom: '1rem' }}>Calendar view of your rooms and reservations.</p>
                    <p>See which guests are arriving or checked in, assign and change rooms, and schedule maintenances.</p>
                </DashboardCard>
            </div>

            <style>{`
                .dashboard-grid {
                    padding: 2rem;
                    background-color: #f7fafc; /* Lighter background */
                }
                .apaleo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                .btn-apaleo {
                    width: 100%;
                    background-color: #F6AD55; /* Apaleo Orange-ish */
                    color: white;
                    border: none;
                    padding: 0.75rem;
                    border-radius: 4px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-apaleo:hover {
                    background-color: #ED8936;
                }
            `}</style>
        </main>
    );
}

const InputGroup = ({ label, defaultValue, icon }) => (
    <div>
        <label style={{ fontSize: '0.7rem', color: '#718096', display: 'block', marginBottom: '2px' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <input type="text" defaultValue={defaultValue} style={inputStyle} />
            {icon && <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem' }}>{icon}</span>}
        </div>
    </div>
);

const StatBlock = ({ label, counts }) => (
    <div style={{ width: '100%' }}>
        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem' }}>{label}</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            {counts.map((c, i) => (
                <div key={i}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#2d3748' }}>{c.v}</div>
                    <div style={{ fontSize: '0.7rem', color: '#718096' }}>{c.l}</div>
                </div>
            ))}
        </div>
    </div>
);

const MiniStat = ({ v, l }) => (
    <div>
        <div style={{ fontWeight: 600, color: '#2d3748' }}>{v}</div>
        <div style={{ fontSize: '0.7rem', color: '#718096' }}>{l}</div>
    </div>
);

const inputStyle = {
    width: '100%',
    padding: '0.4rem 0.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#2d3748'
};
