import React, { useState } from 'react';
import { RATE_PLANS, UNIT_GROUPS } from '../data/mockData';

export default function Rates() {
    const [activeTab, setActiveTab] = useState('rate-plans');

    const renderRatePlans = () => (
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
                        <th style={headerStyle}>Name</th>
                        <th style={headerStyle}>Code</th>
                        <th style={headerStyle}>Cancellation Policy</th>
                        <th style={headerStyle}>Price Adjustment</th>
                        <th style={headerStyle}>Description</th>
                        <th style={{ ...headerStyle, width: '50px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {RATE_PLANS.map(plan => (
                        <tr key={plan.id} style={{ borderBottom: '1px solid #edf2f7' }} className="table-row-hover">
                            <td style={{ ...cellStyle, fontWeight: 500, color: 'var(--color-text-main)' }}>{plan.name}</td>
                            <td style={cellStyle}>
                                <span style={{ fontFamily: 'monospace', background: '#edf2f7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                    {plan.code}
                                </span>
                            </td>
                            <td style={cellStyle}>
                                <span style={{
                                    color: plan.cancellationPolicy === 'Non-Refundable' ? 'var(--color-danger)' : 'var(--color-success)',
                                    fontWeight: 500
                                }}>
                                    {plan.cancellationPolicy}
                                </span>
                            </td>
                            <td style={cellStyle}>
                                {plan.basePrice === null ? 'Base Value' :
                                    plan.basePrice > 0 ? `+ $${plan.basePrice}` : `- ${Math.abs(plan.basePrice)}%`}
                            </td>
                            <td style={cellStyle}>{plan.description}</td>
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

    const renderPricingGrid = () => {
        // Mock Grid for pricing
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date('2025-12-21');
            d.setDate(d.getDate() + i);
            return d;
        });

        return (
            <div className="table-container" style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflowX: 'auto',
                border: '1px solid rgba(0,0,0,0.02)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: 'rgba(247, 250, 252, 0.5)', borderBottom: '1px solid #edf2f7' }}>
                            <th style={{ ...headerStyle, width: '200px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 10 }}>Rate Plan / Room</th>
                            {days.map(d => (
                                <th key={d.toString()} style={{ ...headerStyle, textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                    {d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {RATE_PLANS.map(plan => (
                            <React.Fragment key={plan.id}>
                                <tr style={{ background: '#f7fafc', borderBottom: '1px solid #edf2f7' }}>
                                    <td colSpan={8} style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                        {plan.name} ({plan.code})
                                    </td>
                                </tr>
                                {UNIT_GROUPS.slice(0, 3).map(group => ( // Show first 3 groups for brevity
                                    <tr key={`${plan.id}-${group.id}`} style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={{ ...cellStyle, borderRight: '1px solid #edf2f7', position: 'sticky', left: 0, background: 'white' }}>
                                            {group.name}
                                        </td>
                                        {days.map((_, i) => {
                                            let price = 100 + (group.rank * 20); // base logic
                                            if (plan.basePrice !== null) {
                                                if (plan.basePrice < 0) price = price * (1 - (Math.abs(plan.basePrice) / 100)); // Apply discount %
                                                else price += plan.basePrice; // Apply flat add
                                            }
                                            // Weekend hike
                                            if (i === 5 || i === 6) price += 20;

                                            return (
                                                <td key={i} style={{ ...cellStyle, textAlign: 'center', cursor: 'pointer' }}>
                                                    <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid transparent', transition: 'all 0.1s' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-light)' }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.background = 'transparent' }}
                                                    >
                                                        ${Math.round(price)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <h1>Rates</h1>
                    <p className="subtitle">Configure rate plans and manage daily pricing.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
                        <button className="btn" style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>≡</span> Filter
                        </button>
                        <button className="btn" style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>⇩</span> Export
                        </button>
                    </div>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> New Rate Plan
                    </button>
                </div>
            </header>

            {/* Sub-navigation Tabs */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
                <button
                    onClick={() => setActiveTab('rate-plans')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.75rem 0',
                        fontSize: '0.95rem',
                        fontWeight: activeTab === 'rate-plans' ? 600 : 500,
                        color: activeTab === 'rate-plans' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        borderBottom: activeTab === 'rate-plans' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        cursor: 'pointer'
                    }}
                >
                    Rate Plans
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.75rem 0',
                        fontSize: '0.95rem',
                        fontWeight: activeTab === 'calendar' ? 600 : 500,
                        color: activeTab === 'calendar' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        borderBottom: activeTab === 'calendar' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        cursor: 'pointer'
                    }}
                >
                    Calendar
                </button>
            </div>

            {activeTab === 'rate-plans' ? renderRatePlans() : renderPricingGrid()}

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
