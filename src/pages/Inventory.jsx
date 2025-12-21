import React, { useState } from 'react';
import { UNIT_GROUPS, UNITS, UNIT_ATTRIBUTES } from '../data/mockData';

export default function Inventory() {
    const [activeTab, setActiveTab] = useState('units');
    const [searchTerm, setSearchTerm] = useState('');

    const renderToolbar = (placeholder) => (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '0.6rem 1rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: 'var(--radius-sm)',
                        minWidth: '300px',
                        fontSize: '0.9rem'
                    }}
                />
                <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: 'var(--color-text-secondary)' }}>
                    Filter
                </button>
            </div>
        </div>
    );

    const renderUnits = () => (
        <>
            {renderToolbar("Search units by name...")}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}><input type="checkbox" /></th>
                            <th style={headerStyle}>Name</th>
                            <th style={headerStyle}>Unit Group</th>
                            <th style={headerStyle}>Occupancy</th>
                            <th style={headerStyle}>Attributes</th>
                            <th style={{ ...headerStyle, width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {UNITS.filter(u => u.name.includes(searchTerm)).map(unit => {
                            const group = UNIT_GROUPS.find(g => g.id === unit.groupId);
                            return (
                                <tr key={unit.id} className="table-row-hover">
                                    <td style={cellStyle}><input type="checkbox" /></td>
                                    <td style={{ ...cellStyle, fontWeight: 500, color: 'var(--color-text-main)' }}>{unit.name}</td>
                                    <td style={cellStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                backgroundColor: group?.color || '#ccc'
                                            }}></span>
                                            {group?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td style={cellStyle}>{unit.occupancy}</td>
                                    <td style={cellStyle}>
                                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                            {unit.attributes.map(attr => (
                                                <span key={attr} style={{
                                                    background: '#edf2f7', color: '#4a5568', padding: '2px 6px',
                                                    borderRadius: '4px', fontSize: '0.75rem'
                                                }}>
                                                    {attr}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={cellStyle}>⋮</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderUnitGroups = () => (
        <>
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
                <button className="btn btn-primary">+ New Unit Group</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={headerStyle}>Color</th>
                            <th style={headerStyle}>Name</th>
                            <th style={headerStyle}>Code</th>
                            <th style={headerStyle}>Occupancy</th>
                            <th style={headerStyle}>Member Count</th>
                            <th style={headerStyle}>Rank</th>
                            <th style={{ ...headerStyle, width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {UNIT_GROUPS.map(group => (
                            <tr key={group.id} className="table-row-hover">
                                <td style={cellStyle}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '4px',
                                        backgroundColor: group.color
                                    }}></div>
                                </td>
                                <td style={{ ...cellStyle, fontWeight: 500, color: 'var(--color-text-main)' }}>
                                    {group.name}
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{group.code}</div>
                                </td>
                                <td style={cellStyle}>{group.code}</td>
                                <td style={cellStyle}>{group.occupancy}</td>
                                <td style={cellStyle}>{group.count}</td>
                                <td style={cellStyle}>{group.rank}</td>
                                <td style={cellStyle}>⋮</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderAttributes = () => (
        <>
            {renderToolbar("Search by name or description...")}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={headerStyle}>Name</th>
                            <th style={headerStyle}>Description</th>
                            <th style={{ ...headerStyle, width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {UNIT_ATTRIBUTES.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map(attr => (
                            <tr key={attr.id} className="table-row-hover">
                                <td style={{ ...cellStyle, fontWeight: 500, color: 'var(--color-text-main)' }}>{attr.name}</td>
                                <td style={cellStyle}>{attr.description}</td>
                                <td style={cellStyle}>⋮</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <h1>Inventory</h1>
                    <p className="subtitle">Manage your units, unit groups, and attributes.</p>
                </div>
                {activeTab === 'units' && (
                    <button className="btn btn-primary">
                        <span>+ New Unit</span>
                    </button>
                )}
                {activeTab === 'attributes' && (
                    <button className="btn btn-primary">
                        <span>+ New Attribute</span>
                    </button>
                )}
            </header>

            {/* Sub-navigation Tabs */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
                {['Unit groups', 'Units', 'Unit attributes'].map((tab) => {
                    const tabKey = tab.toLowerCase().replace(' ', '-').split('-').pop() === 'attributes' ? 'attributes' :
                        tab === 'Unit groups' ? 'groups' : 'units';

                    const isActive = activeTab === tabKey;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tabKey)}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: '0.75rem 0',
                                marginRight: '1rem',
                                fontSize: '0.95rem',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    )
                })}
            </div>

            {activeTab === 'units' && renderUnits()}
            {activeTab === 'groups' && renderUnitGroups()}
            {activeTab === 'attributes' && renderAttributes()}

            <style>{`
                .table-container {
                    background: white;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.02);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                thead tr {
                    background: rgba(247, 250, 252, 0.5);
                    border-bottom: 1px solid #edf2f7;
                }
                .table-row-hover:hover {
                    background-color: var(--color-surface-hover);
                }
                tr {
                    border-bottom: 1px solid #edf2f7;
                }
                tr:last-child {
                    border-bottom: none;
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
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem'
};
