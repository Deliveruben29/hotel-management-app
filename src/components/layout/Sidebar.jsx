import React from 'react';

const navItems = ['Dashboard', 'Reservations', 'Rack', 'Housekeeping', 'Availability', 'Inventory', 'Rates', 'Services', 'Companies', 'Finance'];

export default function Sidebar({ activeTab, onNavigate }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand">
                    <span style={{ fontSize: '1.8rem' }}>⌘</span>
                    Hotel<b style={{ color: 'var(--color-primary)' }}>Manager</b>
                </div>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <a
                        key={item}
                        href="#"
                        className={`nav-item ${activeTab === item ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate(item);
                        }}
                    >
                        {item}
                    </a>
                ))}
            </nav>
        </aside>
    );
}
