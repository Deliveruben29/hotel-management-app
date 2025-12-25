import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// Enhanced nav structure to support submenus
const navItems = [
    { path: '/', label: 'Dashboard', icon: '⊞' },
    { path: '/reservations', label: 'Reservations', icon: '📅' },
    { path: '/rack', label: 'Room rack', icon: '🛏' },
    { path: '/housekeeping', label: 'Housekeeping', icon: '🧹' },
    { path: '/availability', label: 'Availability', icon: '✓' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/rates', label: 'Rates', icon: '🏷' },
    { path: '/services', label: 'Services', icon: '🛎' },
    { path: '/companies', label: 'Companies', icon: '🏢' },
    { path: '/finance', label: 'Finance', icon: '💰' },
    {
        path: '/reports',
        label: 'Reports',
        icon: '📊',
        children: [
            { path: '/reports/overview', label: 'Overview' },
            { path: '/reports/gm', label: 'General Manager' },
            { path: '/reports/revenues', label: 'Revenues' },
            { path: '/reports/services', label: 'Ordered services' },
            { path: '/reports/guests', label: 'Guest statistics' }
        ]
    },
    { path: '/audit', label: 'Audit / Logs', icon: '📋' },
    { path: '/settings', label: 'Settings', icon: '⚙' }
];

export default function Sidebar() {
    const location = useLocation();
    const [expandedGroups, setExpandedGroups] = useState({});

    // Auto-expand if active is child or self
    useEffect(() => {
        const newExpanded = { ...expandedGroups };
        let hasChanges = false;

        navItems.forEach(item => {
            if (item.children) {
                const isChildActive = item.children.some(c => location.pathname === c.path);
                const isParentActive = location.pathname === item.path;

                if ((isChildActive || isParentActive) && !newExpanded[item.path]) {
                    newExpanded[item.path] = true;
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            setExpandedGroups(newExpanded);
        }
    }, [location.pathname]);

    const toggleGroup = (e, path) => {
        e.preventDefault();
        setExpandedGroups(prev => ({ ...prev, [path]: !prev[path] }));
    };

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
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedGroups[item.path];

                    // We only want 'active' class on parent if it matches exactly OR one of its children is active?
                    // Typically NavLink 'end' prop handles exact matching.
                    // But for the parent of a submenu, we might want it highlighted if a child is active.
                    // NavLink automatically adds 'active' class if url matches (partial default for start).

                    return (
                        <div key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                end={!hasChildren} // If it has children, /reports should be active for /reports/gm too? Yes, usually.
                                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                                <span style={{ width: '20px', textAlign: 'center' }}>{item.icon}</span>
                                {item.label}
                                {hasChildren && (
                                    <span
                                        style={{ marginLeft: 'auto', fontSize: '0.8rem' }}
                                        onClick={(e) => toggleGroup(e, item.path)}
                                    >
                                        {isExpanded ? '▼' : '▶'}
                                    </span>
                                )}
                            </NavLink>

                            {/* Submenu */}
                            {hasChildren && isExpanded && (
                                <div className="submenu" style={{ paddingLeft: '2.5rem', background: '#F7FAFC' }}> {/* Lighter background */}
                                    {item.children.map(child => (
                                        <NavLink
                                            key={child.path}
                                            to={child.path}
                                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', color: '#4A5568' }}
                                        >
                                            {child.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
            <style>{`
                .submenu .nav-item {
                    color: #4A5568 !important; /* Force dark text for visibility */
                }
                .submenu .nav-item:hover {
                    color: var(--color-primary) !important;
                    background-color: #EDF2F7;
                }
                .submenu .nav-item.active {
                    color: var(--color-primary) !important;
                    font-weight: 600;
                    background: #E6FFFA !important; /* Light teal bg for active subitem */
                }
            `}</style>
        </aside>
    );
}
