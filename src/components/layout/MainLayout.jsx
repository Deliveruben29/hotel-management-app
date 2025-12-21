import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function MainLayout({ children, activeTab, onNavigate }) {
    return (
        <div className="app-container">
            <Sidebar activeTab={activeTab} onNavigate={onNavigate} />
            <div className="main-content">
                <TopHeader />
                {children}
            </div>
        </div>
    );
}
