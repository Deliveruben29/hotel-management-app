import React, { useState } from 'react';
import { MOCK_RESERVATIONS } from '../data/mockData';

export default function Finance() {
    const [activeTab, setActiveTab] = useState('invoices');

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
                    <button className="btn btn-primary">
                        <span>+ New Invoice</span>
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
                {['Invoices', 'Transactions', 'Cash Book', 'Reports'].map(tab => (
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

            {activeTab === 'invoices' ? renderInvoices() : (
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
