import React, { useState } from 'react';
import { RATE_PLANS, UNIT_GROUPS } from '../data/mockData';

export default function Rates() {
    const [activeTab, setActiveTab] = useState('rate-plans');

    // State for Rate Plans (Editable)
    const [ratePlans, setRatePlans] = useState(RATE_PLANS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        cancellationPolicy: 'Flexible',
        basePrice: 0,
        description: ''
    });

    // --- Handlers ---

    const openCreateModal = () => {
        setEditingPlan(null);
        setFormData({ name: '', code: '', cancellationPolicy: 'Flexible', basePrice: 0, description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            code: plan.code,
            cancellationPolicy: plan.cancellationPolicy,
            basePrice: plan.basePrice === null ? 0 : plan.basePrice,
            description: plan.description
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this rate plan?')) {
            setRatePlans(ratePlans.filter(p => p.id !== id));
        }
    };

    const handleSave = () => {
        if (!formData.name || !formData.code) return alert('Name and Code are required.');

        const valBasePrice = Number(formData.basePrice);

        const newPlanData = {
            name: formData.name,
            code: formData.code.toUpperCase(),
            cancellationPolicy: formData.cancellationPolicy,
            basePrice: valBasePrice === 0 ? null : valBasePrice, // 0 means 'Base Value'
            description: formData.description,
            currency: 'CHF'
        };

        if (editingPlan) {
            // Update
            setRatePlans(ratePlans.map(p => p.id === editingPlan.id ? { ...p, ...newPlanData } : p));
        } else {
            // Create
            const newId = `RP-${Math.floor(1000 + Math.random() * 9000)}`;
            setRatePlans([...ratePlans, { id: newId, ...newPlanData }]);
        }
        setIsModalOpen(false);
    };

    // --- Renders ---

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
                        <th style={{ ...headerStyle, width: '80px', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ratePlans.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
                                No rate plans found. Create one to get started.
                            </td>
                        </tr>
                    ) : (
                        ratePlans.map(plan => (
                            <tr
                                key={plan.id}
                                style={{ borderBottom: '1px solid #edf2f7', cursor: 'pointer' }}
                                className="table-row-hover"
                                onClick={() => openEditModal(plan)}
                            >
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
                                    {plan.basePrice === null || plan.basePrice === 0 ?
                                        <span style={{ color: '#718096' }}>Base Value</span> :
                                        plan.basePrice > 0 ?
                                            <span style={{ color: '#e53e3e' }}>+ {plan.basePrice} CHF</span> :
                                            <span style={{ color: '#38a169' }}>{plan.basePrice}%</span>
                                    }
                                </td>
                                <td style={cellStyle}>{plan.description}</td>
                                <td style={cellStyle}>
                                    <button
                                        onClick={(e) => handleDelete(plan.id, e)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: '#cbd5e1', fontSize: '1.2rem', padding: '0 0.5rem'
                                        }}
                                        className="hover-delete"
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <style>{`
                .table-row-hover:hover {
                    background-color: var(--color-surface-hover);
                }
                .hover-delete:hover {
                    color: #e53e3e !important;
                }
            `}</style>
        </div>
    );

    const renderPricingGrid = () => {
        // Dynamic Grid using live ratePlans
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
                        {ratePlans.map(plan => (
                            <React.Fragment key={plan.id}>
                                <tr style={{ background: '#f7fafc', borderBottom: '1px solid #edf2f7' }}>
                                    <td colSpan={8} style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                        {plan.name} ({plan.code})
                                    </td>
                                </tr>
                                {UNIT_GROUPS.slice(0, 3).map(group => (
                                    <tr key={`${plan.id}-${group.id}`} style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={{ ...cellStyle, borderRight: '1px solid #edf2f7', position: 'sticky', left: 0, background: 'white' }}>
                                            {group.name}
                                        </td>
                                        {days.map((_, i) => {
                                            // Base calculation: Starts at 100 for Rank 1
                                            let price = 100 + ((group.rank - 1) * 30);

                                            // Rate Plan Adjustment
                                            if (plan.basePrice !== null && plan.basePrice !== 0) {
                                                if (plan.basePrice < 0) price = price * (1 - (Math.abs(plan.basePrice) / 100)); // % discount
                                                else price += plan.basePrice; // Flat add
                                            }

                                            // Weekend hike
                                            if (i === 5 || i === 6) price += 15;

                                            return (
                                                <td key={i} style={{ ...cellStyle, textAlign: 'center', cursor: 'pointer' }}>
                                                    <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid transparent', transition: 'all 0.1s' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-light)' }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.background = 'transparent' }}
                                                    >
                                                        {Math.round(price)}
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
                    <button
                        className="btn btn-primary"
                        onClick={openCreateModal}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> New Rate Plan
                    </button>
                </div>
            </header>

            {/* Sub-navigation Tabs */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
                <button
                    onClick={() => setActiveTab('rate-plans')}
                    style={{
                        background: 'none', border: 'none', padding: '0.75rem 0', fontSize: '0.95rem',
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
                        background: 'none', border: 'none', padding: '0.75rem 0', fontSize: '0.95rem',
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

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '450px', maxWidth: '90%' }}>
                        <h2 style={{ marginTop: 0, color: '#2d3748' }}>{editingPlan ? 'Edit Rate Plan' : 'New Rate Plan'}</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g., Summer Special"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Code</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        style={inputStyle}
                                        placeholder="e.g., SUM25"
                                        maxLength={6}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Price Adjustment</label>
                                    <input
                                        type="number"
                                        value={formData.basePrice}
                                        onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                                        style={inputStyle}
                                        placeholder="0 (Standard)"
                                    />
                                    <div style={{ fontSize: '0.7rem', color: '#718096', marginTop: '2px' }}>
                                        Add (+) or Discount % (-). 0 = Standard Base (100 CHF).
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Cancellation Policy</label>
                                <select
                                    value={formData.cancellationPolicy}
                                    onChange={e => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="Flexible">Flexible (Free until 24h)</option>
                                    <option value="Non-Refundable">Non-Refundable</option>
                                    <option value="24h Notice">24h Notice</option>
                                    <option value="48h Notice">48h Notice</option>
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ ...inputStyle, minHeight: '80px' }}
                                    placeholder="Internal description..."
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={() => setIsModalOpen(false)} className="btn" style={{ background: 'white', border: '1px solid #cbd5e1' }}>Cancel</button>
                            <button onClick={handleSave} className="btn btn-primary">{editingPlan ? 'Save Changes' : 'Create Plan'}</button>
                        </div>
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

const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#4a5568',
    marginBottom: '0.5rem'
};

const inputStyle = {
    width: '100%',
    padding: '0.6rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '0.95rem'
};
