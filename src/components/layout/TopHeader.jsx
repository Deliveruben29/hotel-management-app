import React from 'react';

export default function TopHeader() {
    return (
        <header className="top-header">
            <div className="search-bar">
                <input type="text" placeholder="Search reservations, guests..." />
            </div>
            <div className="user-profile">
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Admin User</span>
                <div className="avatar">AD</div>
            </div>
        </header>
    );
}
