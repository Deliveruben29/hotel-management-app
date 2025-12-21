import React, { useState } from 'react';

// Enhanced nav structure to support submenus
const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'Reservations', label: 'Reservations', icon: '📅' },
    { id: 'Rack', label: 'Room rack', icon: '🛏' },
    { id: 'Housekeeping', label: 'Housekeeping', icon: '🧹' },
    { id: 'Availability', label: 'Availability', icon: '✓' },
    { id: 'Inventory', label: 'Inventory', icon: '📦' },
    { id: 'Rates', label: 'Rates', icon: '🏷' },
    { id: 'Services', label: 'Services', icon: '🛎' },
    { id: 'Companies', label: 'Companies', icon: '🏢' },
    { id: 'Finance', label: 'Finance', icon: '💰' },
    {
        id: 'Reports',
        label: 'Reports',
        icon: '📊',
        children: [
            { id: 'Reports-Overview', label: 'Overview' },
            { id: 'Reports-GM', label: 'General Manager' },
            { id: 'Reports-Revenues', label: 'Revenues' },
            { id: 'Reports-Services', label: 'Ordered services' },
            { id: 'Reports-Guests', label: 'Guest statistics' }
        ]
    },
    { id: 'Audit', label: 'Audit / Logs', icon: '📋' },
    { id: 'Settings', label: 'Settings', icon: '⚙' }
];

export default function Sidebar({ activeTab, onNavigate }) {
    // State to track expanded items. For now, we just auto-expand if activeTab is a child
    // or if the user clicks the parent. 
    // Simple logic: If activeTab starts with "Reports", expand Reports.

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand">
                    <span style={{ fontSize: '1.8rem' }}>⌘</span>
                    Hotel<b style={{ color: 'var(--color-primary)' }}>Manager</b>
                </div>
                {/* Context dropdown simulation */}
                <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem',
                    background: '#2d3748',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    color: '#e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>Context</div>
                        <div>Jezebel Hotel Rhein</div>
                    </div>
                    <span>▼</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id || (item.children && item.children.some(c => c.id === activeTab));
                    const isExpanded = isActive && item.children; // Simple expansion logic

                    return (
                        <div key={item.id}>
                            <a
                                href="#"
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate(item.id);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                <span style={{ width: '20px', textAlign: 'center' }}>{item.icon}</span>
                                {item.label}
                                {item.children && <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>{isExpanded ? '▼' : '▶'}</span>}
                            </a>

                            {/* Submenu */}
                            {item.children && isExpanded && (
                                <div className="submenu" style={{ paddingLeft: '2.5rem', background: 'rgba(0,0,0,0.1)' }}>
                                    {item.children.map(child => (
                                        <a
                                            key={child.id}
                                            href="#"
                                            className={`nav-item ${activeTab === child.id ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                onNavigate(child.id);
                                            }}
                                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                        >
                                            {child.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
            <style>{`
                .submenu .nav-item {
                    color: #a0aec0;
                }
                .submenu .nav-item:hover {
                    color: white;
                }
                .submenu .nav-item.active {
                    color: #F6AD55;
                    font-weight: 500;
                    background: transparent;
                }
            `}</style>
        </aside>
    );
}
