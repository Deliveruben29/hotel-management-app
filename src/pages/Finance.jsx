import React, { useState, useEffect } from 'react';
import { MOCK_RESERVATIONS } from '../data/mockData';
import { ReservationService } from '../services/reservationService';

export default function Finance() {
    const [activeTab, setActiveTab] = useState('invoices');

    // House Folios State
    const [houseFolios, setHouseFolios] = useState([]);
    const [isFolioModalOpen, setIsFolioModalOpen] = useState(false);
    const [newFolioName, setNewFolioName] = useState('');

    useEffect(() => {
        if (activeTab === 'house folios') {
            loadHouseFolios();
        }
    }, [activeTab]);

    const loadHouseFolios = async () => {
        const data = await ReservationService.getHouseAccounts();
        setHouseFolios(data);
    };

    const handleCreateFolio = async (e) => {
        e.preventDefault();
        if (!newFolioName) return;

        const newFolio = {
            guestName: newFolioName,
            status: 'house_account',
            room: null,
            arrival: new Date().toISOString().split('T')[0],
            departure: new Date().toISOString().split('T')[0],
            price: 0,
            adults: 1,
            email: '',
            phone: '',
            extraCharges: []
        };

        try {
            await ReservationService.create(newFolio);
            setNewFolioName('');
            setIsFolioModalOpen(false);
            loadHouseFolios(); // Refresh
        } catch (error) {
            alert('Error creating folio: ' + error.message);
        }
    };

    // Calculate dummy stats
    const totalRevenue = MOCK_RESERVATIONS.reduce((sum, res) => sum + res.rate, 0);
    const outstanding = 4500; // Mock

    // Generate Mock Invoices derived from reservations
    const invoices = MOCK_RESERVATIONS.map((res, i) => ({
        id: `INV-2025-${1000 + i}`,
        date: new Date(res.departure).toISOString().split('T')[0],
        recipient: res.guestName,
        amount: res.rate,
        status: i % 3 === 0 ? 'paid' : (i % 2 === 0 ? 'pending' : 'overdue'),
        description: `Accommodation - Room ${res.room}`
    }));

    const renderInvoices = () => (
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
                        <th style={headerStyle}>Invoice ID</th>
                        <th style={headerStyle}>Date</th>
                        <th style={headerStyle}>Recipient</th>
                        <th style={headerStyle}>Description</th>
                        <th style={headerStyle}>Status</th>
                        <th style={{ ...headerStyle, textAlign: 'right' }}>Amount</th>
                        <th style={{ ...headerStyle, width: '50px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid #edf2f7' }} className="table-row-hover">
                            <td style={{ padding: '1rem' }}><input type="checkbox" /></td>
                            <td style={{ ...cellStyle, fontWeight: 500, fontFamily: 'monospace' }}>{inv.id}</td>
                            <td style={cellStyle}>{new Date(inv.date).toLocaleDateString()}</td>
                            <td style={{ ...cellStyle, color: 'var(--color-text-main)', fontWeight: 500 }}>{inv.recipient}</td>
                            <td style={cellStyle}>{inv.description}</td>
                            <td style={cellStyle}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em',
                                    backgroundColor: inv.status === 'paid' ? 'var(--color-primary-light)' : (inv.status === 'overdue' ? '#FED7D7' : '#FEFCBF'),
                                    color: inv.status === 'paid' ? 'var(--color-primary)' : (inv.status === 'overdue' ? '#C53030' : '#744210'),
                                }}>
                                    {inv.status}
                                </span>
                            </td>
                            <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600 }}>${inv.amount.toFixed(2)}</td>
                            <td style={cellStyle}>⋮</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style>{`
                .table-row-hover:hover {
                    background-color: var(--color-surface-hover);
                }
            `}</style>
        </div>
    );

    const renderHouseFolios = () => {
        return (
            <div className="table-container" style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.02)'
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#2d3748' }}>House Accounts (Active)</h3>
                        <span style={{ fontSize: '0.8rem', color: '#718096', background: '#edf2f7', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>{houseFolios.length}</span>
                    </div>
                    <button
                        onClick={() => setIsFolioModalOpen(true)}
                        className="btn"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white' }}
                    >
                        + Add Account
                    </button>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#f8fafc' }}>
                            <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                                <th style={headerStyle}>Folio ID</th>
                                <th style={headerStyle}>Account Name</th>
                                <th style={headerStyle}>Created</th>
                                <th style={headerStyle}>Status</th>
                                <th style={{ ...headerStyle, textAlign: 'right' }}>Balance</th>
                                <th style={{ ...headerStyle, width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {houseFolios.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>No active house accounts found.</td>
                                </tr>
                            ) : houseFolios.map(folio => (
                                <tr key={folio.id} style={{ borderBottom: '1px solid #edf2f7' }} className="table-row-hover">
                                    <td style={{ ...cellStyle, fontFamily: 'monospace', fontWeight: 500 }}>#{folio.id.slice(0, 8)}...</td>
                                    <td style={{ ...cellStyle, fontWeight: 600, color: 'var(--color-text-main)' }}>{folio.name}</td>
                                    <td style={cellStyle}>{new Date(folio.lastUpdate || new Date()).toLocaleDateString()}</td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                                            backgroundColor: '#EBF8FF', color: '#2B6CB0'
                                        }}>
                                            {folio.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600 }}>CHF {folio.balance.toFixed(2)}</td>
                                    <td style={cellStyle}>⋮</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };



    const StatCard = ({ title, value, sub, color }) => (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid rgba(0,0,0,0.02)',
            flex: 1
        }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>{title}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: color || 'var(--color-text-main)', marginBottom: '0.25rem' }}>{value}</div>
            {sub && <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{sub}</div>}
        </div>
    );

    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <h1>Finance</h1>
                    <p className="subtitle">Invoices, payments, and revenue reports.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }}>Export Report</button>
                    <button className="btn btn-primary" onClick={() => setIsFolioModalOpen(true)}>
                        <span>+ New Folio</span>
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard title="Total Revenue (MTD)" value={`$${totalRevenue.toLocaleString()}`} sub="↑ 12% vs last month" />
                <StatCard title="Outstanding Balance" value={`$${outstanding.toLocaleString()}`} sub="5 invoices overdue" color="#C53030" />
                <StatCard title="Avg Daily Rate (ADR)" value="$156.00" sub="↑ $4.50 vs last month" />
            </div>

            {/* Sub-navigation Tabs */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
                {['Invoices', 'House Folios', 'Transactions', 'Cash Book', 'Reports'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.75rem 0',
                            fontSize: '0.95rem',
                            fontWeight: activeTab === tab.toLowerCase() ? 600 : 500,
                            color: activeTab === tab.toLowerCase() ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            borderBottom: activeTab === tab.toLowerCase() ? '2px solid var(--color-primary)' : '2px solid transparent',
                            cursor: 'pointer'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'invoices' ? renderInvoices() : activeTab === 'house folios' ? renderHouseFolios() : (
                <div style={{
                    padding: '4rem',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    border: '2px dashed #cbd5e1',
                    borderRadius: 'var(--radius-lg)',
                    margin: '2rem',
                    background: 'rgba(247, 250, 252, 0.5)'
                }}>
                    <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                    <p>Under construction. This feature is part of the Pro Finance package.</p>
                </div>
            )}

            {isFolioModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ marginTop: 0 }}>Create House Folio</h3>
                        <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Open a new account for non-room charges.</p>

                        <form onSubmit={handleCreateFolio}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Account Name</label>
                                <input
                                    autoFocus
                                    placeholder="e.g. Parking - Non Guest, Staff Tab..."
                                    value={newFolioName}
                                    onChange={e => setNewFolioName(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Folio</button>
                                <button type="button" className="btn" onClick={() => setIsFolioModalOpen(false)} style={{ border: '1px solid #e2e8f0' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
