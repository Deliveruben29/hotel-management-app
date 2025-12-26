import React, { useState, useEffect } from 'react';
import { UNIT_GROUPS, UNITS, UNIT_ATTRIBUTES } from '../data/mockData';
import { InventoryService } from '../services/inventoryService';

export default function Inventory() {
    const [activeTab, setActiveTab] = useState('units');
    const [searchTerm, setSearchTerm] = useState('');

    // --- Data Loading ---
    const [unitGroups, setUnitGroups] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Modal State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('unit'); // 'unit' | 'group'
    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Load Groups
            let groups = await InventoryService.getUnitGroups();
            if (!groups || groups.length === 0) {
                console.log('Seeding Unit Groups...');
                for (const g of UNIT_GROUPS) {
                    try { await InventoryService.createUnitGroup(g); } catch (e) { }
                }
                groups = await InventoryService.getUnitGroups();
            }

            // 2. Load Units 
            let loadedUnits = await InventoryService.getUnits();
            if ((!loadedUnits || loadedUnits.length === 0) && groups.length > 0) {
                console.log('Seeding Units...');
                for (const u of UNITS) {
                    try { await InventoryService.createUnit(u); } catch (e) { }
                }
                loadedUnits = await InventoryService.getUnits();
            }

            // Join count
            const groupsWithCount = groups.map(g => ({
                ...g,
                count: loadedUnits ? loadedUnits.filter(u => u.groupId === g.id).length : 0
            }));

            setUnitGroups(groupsWithCount || []);
            setUnits(loadedUnits || []);
        } catch (err) {
            console.error("Fatal error loading inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const openCreateModal = (type) => {
        // DEBUG: Verify click
        console.log("Opening modal for:", type);

        setModalType(type);
        setFormData(type === 'group' ? { color: '#4fd1c5', occupancy: 2 } : { condition: 'Clean', attributes: [] });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (modalType === 'group') {
                const newId = `UG-${Math.floor(1000 + Math.random() * 9000)}`;
                const payload = {
                    id: newId,
                    name: formData.name || 'New Group',
                    code: formData.code || 'GRP',
                    color: formData.color,
                    occupancy: Number(formData.occupancy) || 1,
                    rank: 99
                };
                await InventoryService.createUnitGroup(payload);
                setUnitGroups([...unitGroups, { ...payload, count: 0 }]);
            } else if (modalType === 'unit') {
                const newId = `${Math.floor(100 + Math.random() * 900)}`; // Simple 3 digit room num style
                const payload = {
                    id: newId,
                    name: formData.name || newId,
                    groupId: formData.groupId,
                    condition: formData.condition || 'Clean',
                    attributes: formData.attributes || []
                };
                await InventoryService.createUnit(payload);
                setUnits([...units, payload]);
                // Update count locally
                setUnitGroups(unitGroups.map(g => g.id === payload.groupId ? { ...g, count: g.count + 1 } : g));
            }
            setIsModalOpen(false);
        } catch (err) {
            alert('Error saving: ' + err.message);
        }
    };

    // --- Render Helpers ---

    const renderToolbar = (placeholder) => (
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '350px' }}>
                <div style={floatingLabelStyle}>Search</div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchInputStyle}
                />
            </div>
            {/* Export button placeholder */}
        </div>
    );

    const renderModal = () => (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2d3748' }}>
                    {modalType === 'group' ? 'New Unit Group' : 'New Unit'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {modalType === 'group' && (
                        <>
                            <div>
                                <label style={labelStyle}>Name</label>
                                <input style={inputStyle} value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Double Deluxe" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Code</label>
                                    <input style={inputStyle} value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="DBL" maxLength={5} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Occupancy</label>
                                    <input type="number" style={inputStyle} value={formData.occupancy || ''} onChange={e => setFormData({ ...formData, occupancy: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Color Tag</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="color" value={formData.color || '#4fd1c5'} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ height: '40px', width: '60px', border: 'none', cursor: 'pointer' }} />
                                    <span style={{ alignSelf: 'center', color: '#718096', fontSize: '0.9rem' }}>{formData.color}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {modalType === 'unit' && (
                        <>
                            <div>
                                <label style={labelStyle}>Unit Name / Number</label>
                                <input style={inputStyle} value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. 104" />
                            </div>
                            <div>
                                <label style={labelStyle}>Unit Group</label>
                                <select style={inputStyle} value={formData.groupId || ''} onChange={e => setFormData({ ...formData, groupId: e.target.value })}>
                                    <option value="">Select a Group...</option>
                                    {unitGroups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Condition</label>
                                <select style={inputStyle} value={formData.condition || ''} onChange={e => setFormData({ ...formData, condition: e.target.value })}>
                                    <option value="Clean">Clean</option>
                                    <option value="Dirty">Dirty</option>
                                    <option value="Inspect">Inspect</option>
                                </select>
                            </div>
                        </>
                    )}

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={() => setIsModalOpen(false)} className="btn" style={{ background: 'white', border: '1px solid #cbd5e1' }}>Cancel</button>
                    <button onClick={handleSave} className="btn btn-primary">Create</button>
                </div>
            </div>
        </div>
    );

    // --- Main Render ---

    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ color: '#718096' }}>Jezebel Hotel Rhein</span> / <span style={{ background: '#FED7D7', padding: '2px 4px', borderRadius: '4px', color: 'black' }}>Test</span> / Inventory
                    </div>
                    <h1>Managed Inventory</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {activeTab === 'units' && (
                        <button className="btn btn-primary" onClick={() => openCreateModal('unit')}>+ New unit</button>
                    )}
                    {activeTab === 'groups' && (
                        <button className="btn btn-primary" onClick={() => openCreateModal('group')}>+ New unit group</button>
                    )}
                </div>
            </header>

            {/* Tabs */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
                {['Unit groups', 'Units', 'Unit attributes'].map((tab) => {
                    const tabKey = tab.toLowerCase().replace(' ', '-').split('-').pop() === 'attributes' ? 'attributes' : tab === 'Unit groups' ? 'groups' : 'units';
                    const isActive = activeTab === tabKey;
                    return (
                        <button key={tab} onClick={() => setActiveTab(tabKey)}
                            style={{
                                background: 'none', border: 'none', padding: '0.75rem 0', marginRight: '1rem', fontSize: '0.95rem',
                                fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer'
                            }}>
                            {tab}
                        </button>
                    )
                })}
            </div>

            {/* Tables */}
            {loading ? <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div> : (
                <>
                    {activeTab === 'units' && (
                        <div className="table-container">
                            {renderToolbar("Search units...")}
                            <table>
                                <thead>
                                    <tr>
                                        <th style={headerStyle}>Name</th>
                                        <th style={headerStyle}>Unit Group</th>
                                        <th style={headerStyle}>Condition</th>
                                        <th style={headerStyle}>Attributes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.filter(u => u.name && u.name.includes(searchTerm)).map(unit => {
                                        const group = unitGroups.find(g => g.id === unit.groupId);
                                        return (
                                            <tr key={unit.id} className="table-row-hover">
                                                <td style={{ ...cellStyle, fontWeight: 500, color: 'var(--color-text-main)' }}>{unit.name}</td>
                                                <td style={cellStyle}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', background: group?.color || '#ccc', marginRight: '6px' }}></span>
                                                    {group?.name || '-'}
                                                </td>
                                                <td style={cellStyle}>
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                                        background: unit.condition === 'Clean' ? '#C6F6D5' : unit.condition === 'Dirty' ? '#FED7D7' : '#B2F5EA',
                                                        color: unit.condition === 'Clean' ? '#22543d' : unit.condition === 'Dirty' ? '#822727' : '#285e61'
                                                    }}>
                                                        {unit.condition}
                                                    </span>
                                                </td>
                                                <td style={cellStyle}>{unit.attributes?.join(', ')}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <div className="table-container">
                            {renderToolbar("Search groups...")}
                            <table>
                                <thead>
                                    <tr>
                                        <th style={headerStyle}>Color</th>
                                        <th style={headerStyle}>Name</th>
                                        <th style={headerStyle}>Code</th>
                                        <th style={headerStyle}>Occupancy</th>
                                        <th style={headerStyle}>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unitGroups.map(group => (
                                        <tr key={group.id} className="table-row-hover">
                                            <td style={cellStyle}><div style={{ width: '20px', height: '20px', background: group.color, borderRadius: '4px' }}></div></td>
                                            <td style={{ ...cellStyle, fontWeight: 500 }}>{group.name}</td>
                                            <td style={cellStyle}>{group.code}</td>
                                            <td style={cellStyle}>{group.occupancy}</td>
                                            <td style={cellStyle}>{group.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'attributes' && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>Attributes management coming soon.</div>
                    )}
                </>
            )}

            {isModalOpen && renderModal()}

            <style>{`
                .table-container { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
                table { width: 100%; border-collapse: collapse; }
                thead tr { background: #f7fafc; border-bottom: 1px solid #edf2f7; }
                tr { border-bottom: 1px solid #edf2f7; }
                .table-row-hover:hover { background-color: #f7fafc; }
                .btn-primary { background: var(--color-primary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 4px; cursor: pointer; font-weight: 500; }
            `}</style>
        </main>
    );
}

// Styles
const headerStyle = { textAlign: 'left', padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 };
const cellStyle = { padding: '1rem', fontSize: '0.9rem', color: '#4a5568' };
const floatingLabelStyle = { position: 'absolute', top: '-10px', left: '10px', fontSize: '0.75rem', color: '#2d3748', background: 'white', padding: '0 4px', zIndex: 1 };
const searchInputStyle = { width: '100%', padding: '0.6rem 1rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', padding: '2rem', borderRadius: '8px', width: '450px', maxWidth: '90%' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' };
const inputStyle = { width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.95rem' };
