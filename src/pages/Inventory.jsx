import React, { useState } from 'react';
import { UNIT_GROUPS, UNITS, UNIT_ATTRIBUTES } from '../data/mockData';

export default function Inventory() {
    const [activeTab, setActiveTab] = useState('units');
    const [searchTerm, setSearchTerm] = useState('');

    const renderToolbar = (placeholder) => (
        <div style={{
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ position: 'relative', width: '350px' }}>
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '10px',
                    fontSize: '0.75rem',
                    color: '#2d3748',
                    background: 'white',
                    padding: '0 4px',
                    zIndex: 1
                }}>Search</div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.6rem 1rem',
                        border: '2px solid #2b6cb0', // Focused blue border look or plain
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        outline: 'none'
                    }}
                />
            </div>
            <button className="btn" style={{ background: 'transparent', border: 'none', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <span style={{ fontSize: '1.2rem' }}>⇩</span> Export
            </button>
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
            {/* Toolbar for groups - similar to units but maybe different placeholder logic if needed */}
            {renderToolbar("Search unit groups...")}

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
                    {/* Breadcrumbs */}
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ color: '#718096' }}>Jezebel Hotel Rhein</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        <span style={{ background: '#FED7D7', padding: '2px 4px', borderRadius: '4px', color: 'black' }}>Test</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        Inventory
                    </div>
                    <h1>Inventory</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {activeTab === 'units' && (
                        <button className="btn" style={{ background: 'transparent', color: '#F6AD55', fontWeight: 600, border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span>+</span> New unit
                        </button>
                    )}
                    {activeTab === 'attributes' && (
                        <button className="btn" style={{ background: 'transparent', color: '#F6AD55', fontWeight: 600, border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span>+</span> New attribute
                        </button>
                    )}
                    {activeTab === 'groups' && (
                        <button className="btn" style={{ background: 'transparent', color: '#F6AD55', fontWeight: 600, border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span>+</span> New unit group
                        </button>
                    )}
                </div>
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
